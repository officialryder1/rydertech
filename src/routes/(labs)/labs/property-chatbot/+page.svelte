<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import SEOMeta from '$lib/components/SEOMeta.svelte';
	import StructuredData from '$lib/components/StructuredData.svelte';

	import {
		MessageCircle,
		ArrowLeft,
		Send,
		User,
		Phone,
		Calendar,
		MapPin,
		Bed,
		Bath,
		Home,
		CheckCircle2
	} from '@lucide/svelte';

	import type { EngineState, ChatMessage, Property, Lead, ConversationStep, LocationKey } from '$lib/propertyChatbot';
	import {
		initialState,
		selectPropertyType,
		selectLocation,
		selectProperty,
		enterName,
		enterPhone,
		enterInspectionDate,
		formatDate,
		getSampleLead,
		getProperties,
		getLocationLabels,
		LOCATION_LABELS
	} from '$lib/propertyChatbot';
	import { scoreLead } from '$lib/leadScore';
	import { supabase } from '$lib/supabaseClient';
	import { env } from '$env/dynamic/public';
	import emailjs from '@emailjs/browser';
	import { page } from '$app/stores';

	// Capture lead source from URL params
	const _utmSource = $page.url.searchParams.get('utm_source');
	const _toolParam = $page.url.searchParams.get('tool');
	const leadSource = $derived(
		[_utmSource ? `utm:${_utmSource}` : '', _toolParam ? `tool:${_toolParam}` : ''].filter(Boolean).join('|') || 'direct'
	);

	// Score a lead based on current engine state
	function scoreLeadFromState(state: EngineState): { score: number; tier: 'hot' | 'warm' | 'cool' } {
		const lead = scoreLead({
			tool: 'property_chatbot',
			impactValue: state.selectedProperty?.price || 0,
			revenueAtRisk: state.selectedProperty?.price || 0,
			healthScore: state.propertyType === 'buy' ? 40 : 60
		});
		return { score: lead.points, tier: lead.tier };
	}

	// Engine state
	let engineState = $state<EngineState>(initialState());
	let inputValue = $state('');
	let isSubmitting = $state(false);
	let leadError = $state<string | null>(null);
	let leadSubmitted = $state(false);
	let leadReceived = $state<Lead | null>(null);
	let messagesContainer = $state<HTMLElement>();

	// Auto-scroll to bottom of chat messages when messages change
	$effect(() => {
		if (engineState.messages && messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});
	const properties = getProperties();
	const locationLabels = getLocationLabels();

	function handleOptionClick(option: string) {
		const step = engineState.step;

		if (step === 'property_type') {
			if (option === 'Buy Land/Property') {
				engineState = selectPropertyType(engineState, 'buy');
			} else if (option === 'Rent a Property') {
				engineState = selectPropertyType(engineState, 'rent');
			}
		} else if (step === 'location') {
			const locKey = Object.keys(locationLabels).find(
				(k) => locationLabels[k as keyof typeof locationLabels] === option
			) as keyof typeof locationLabels;
			if (locKey) {
				engineState = selectLocation(engineState, locKey);
			}
		} else if (step === 'property_detail') {
			// The option string is "Title - Price", extract the title and match
			const prop = Object.values(properties).flat().find((p) => {
				const optStr = `${p.title} - ${p.priceFormatted}`;
				return optStr === option || p.title === option;
			});
			if (prop) {
				engineState = selectProperty(engineState, prop.id);
			}
		}
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		inputValue = target.value;
	}

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const step = engineState.step;
		const val = inputValue.trim();

		if (step === 'name') {
			engineState = enterName(engineState, val);
		} else if (step === 'phone') {
			engineState = enterPhone(engineState, val);
		} else if (step === 'inspection_date') {
			engineState = enterInspectionDate(engineState, val);
		}

		inputValue = '';
	}

	async function handleLeadCapture(e: Event) {
		e.preventDefault();
		leadError = null;

		const nameInput = (document.getElementById('lead-name') as HTMLInputElement)?.value || '';
		const phoneInput = (document.getElementById('lead-phone') as HTMLInputElement)?.value || '';
		const emailInput = (document.getElementById('lead-email') as HTMLInputElement)?.value || '';

		if (!nameInput || !phoneInput) {
			leadError = 'Please provide your name and phone number.';
			return;
		}

		isSubmitting = true;

		try {
			// Build the lead object from current engine state + form
			const property = engineState.selectedProperty;
			if (!property) {
				leadError = 'No property selected.';
				return;
			}

			const lead = scoreLead({
				tool: 'property_chatbot',
				impactValue: property.price,
				revenueAtRisk: property.price,
				healthScore: engineState.propertyType === 'buy' ? 40 : 60
			});

			const leadData: Lead = {
				name: nameInput,
				phone: phoneInput,
				email: emailInput,
				propertyType: engineState.propertyType || 'buy',
				location: engineState.location ? locationLabels[engineState.location] : 'Unknown',
				propertyId: property.id,
				propertyTitle: property.title,
				inspectionDate: engineState.inspectionDate,
				leadScore: lead.points,
				leadTier: lead.tier
			};

			// Send via EmailJS
			const serviceId = env.PUBLIC_EMAILJS_SERVICE_ID;
			const templateId = env.PUBLIC_EMAILJS_TEMPLATE_ID;
			const publicKey = env.PUBLIC_EMAILJS_PUBLIC_KEY;

			if (serviceId && templateId && publicKey) {
				try {
					await emailjs.send(
						serviceId,
						templateId,
						{
							from_name: `${nameInput} - Property Chatbot`,
							from_email: emailInput || 'no-email@lead.com',
							company: 'Property Chatbot Lead',
							budget: `${property.priceFormatted} (${engineState.propertyType === 'buy' ? 'Buy' : 'Rent'})`,
							timeline: `Inspection: ${formatDate(engineState.inspectionDate) || 'TBD'}`,
							message: `New property chatbot lead (source: /labs/property-chatbot).\nLead score: ${lead.points}/100 (${lead.tier}).\n\nProspect: ${nameInput}\nPhone: ${phoneInput}\nEmail: ${emailInput || 'N/A'}\nInterest: ${engineState.propertyType === 'buy' ? 'Buying' : 'Renting'}\nLocation: ${engineState.location ? locationLabels[engineState.location] : 'Unknown'}\nProperty: ${property.title} (${property.priceFormatted})\nInspection date: ${formatDate(engineState.inspectionDate) || 'Not selected'}\nLead source: ${leadSource}`,
							lead_type: 'lead_magnet_property_chatbot',
							lead_score: lead.points,
							lead_tier: lead.tier,
							lead_source: leadSource
						},
						{ publicKey }
					);
				} catch (emailErr) {
					console.warn('Property chatbot lead email failed:', emailErr);
				}
			} else {
				console.warn('EmailJS not configured — property chatbot lead not emailed:', nameInput);
			}

			// Persist to Supabase
			try {
				const { error: dbError } = await supabase.from('newsletter_subscriptions').insert([
					{
						email: emailInput || `${phoneInput}@lead.com`,
						source: 'lead_magnet_property_chatbot',
						subscribed_at: new Date().toISOString(),
						lead_score: lead.points,
						lead_tier: lead.tier,
						lead_source: leadSource
					}
				]);
				if (dbError) {
					console.error('Property chatbot lead NOT persisted to DB:', dbError.code, dbError.message);
				}
			} catch (dbErr) {
				console.warn('Supabase insert failed (property chatbot):', dbErr);
			}

			// Store in localStorage for demo preview
			try {
				localStorage.setItem('rydertech_property_lead', JSON.stringify(leadData));
				localStorage.setItem('rydertech_lead_captured', '1');
			} catch {}

			leadSubmitted = true;
			leadReceived = leadData;
		} catch (err) {
			console.warn('Property chatbot lead capture failed:', err);
		} finally {
			isSubmitting = false;
		}
	}

	function resetChatbot() {
		engineState = initialState();
		leadSubmitted = false;
		leadReceived = null;
	}

	function getStepLabel(step: ConversationStep): string {
		const labels: Record<ConversationStep, string> = {
			welcome: 'Intro',
			property_type: 'Property Type',
			location: 'Location',
			property_detail: 'Property Detail',
			name: 'Name',
			phone: 'Phone',
			inspection_date: 'Inspection Date',
			complete: 'Complete'
		};
		return labels[step];
	}

	function getInputLabel(step: ConversationStep): string {
		const labels: Record<ConversationStep, string> = {
			name: 'Your full name',
			phone: 'Your phone number',
			inspection_date: 'Preferred inspection date',
			welcome: '',
			property_type: '',
			location: '',
			property_detail: '',
			complete: ''
		};
		return labels[step] || '';
	}
</script>

<SEOMeta
	data={{
		title: 'Property Chatbot Demo — AI Lead Capture for Real Estate | RyderTech',
		description: 'See a demo of our real estate chatbot that captures leads by guiding prospects from property interest to inspection booking. Buy or rent Abuja properties — then get the lead sent to your CRM.',
		canonical: 'https://rydertech.ng/labs/property-chatbot'
	}}
/>

<StructuredData type="SoftwareApplication" />
<StructuredData type="WebSite" />

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-6xl px-4 py-10">
		<a
			href="/labs"
			class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
			aria-label="Back to Labs"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Labs
		</a>

		<!-- Hero / Header -->
		<header class="mb-10 max-w-3xl">
			<Badge variant="secondary" class="mb-3" aria-label="Demo tool">Real Estate Demo</Badge>
			<h1 class="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
				Property chatbot
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4]">
					lead capture
				</span>
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				Watch the chatbot guide a prospect from property interest to inspection booking, then capture
				their name, phone, and preferred date as a qualified lead ready for your CRM.
			</p>
		</header>

		{#if !leadSubmitted}
			<div class="grid gap-8 lg:grid-cols-[1fr_400px]">
				<!-- Chat Interface -->
				<section class="space-y-6">
					<Card>
						<CardHeader class="pb-4">
							<div class="flex items-center gap-2">
								<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<MessageCircle class="h-5 w-5 text-primary" />
								</div>
								<CardTitle class="flex items-center gap-2 text-base">Property Assistant</CardTitle>
								<Badge variant="outline" class="ml-auto text-xs">
								Step {engineState.step !== 'complete' ? ['property_type','location','property_detail','name','phone','inspection_date'].indexOf(engineState.step) + 1 : 7}/7
								</Badge>
							</div>
							<CardDescription>Chat with the demo to see how the lead capture flow works</CardDescription>
						</CardHeader>
						<CardContent>
								<!-- Messages -->
								<div bind:this={messagesContainer} class="mb-4 flex h-[320px] flex-col gap-3 overflow-y-auto rounded-lg bg-slate-50 p-4">
									{#each engineState.messages as msg, i}
										<div class="flex gap-3 {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
											<div
												class="max-w-[80%] rounded-2xl px-3 py-2 text-sm {msg.role === 'user'
													? 'bg-primary text-white'
													: 'bg-white text-slate-800 border border-slate-200'}"
											>
												<p class="whitespace-pre-wrap">{msg.content}</p>
												{#if msg.property}
													{@const p = msg.property as Property}
													<div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
														<img
															src={p.image}
															alt={p.title}
															class="mb-1 h-24 w-full rounded object-cover"
															loading="lazy"
														/>
														<p class="font-semibold text-xs text-slate-900">{p.title}</p>
														<div class="mt-1 flex gap-3 text-[10px] text-slate-600">
															<span class="flex items-center gap-1"><Bed class="h-3 w-3" />{p.bedrooms} bed</span>
															<span class="flex items-center gap-1"><Bath class="h-3 w-3" />{p.bathrooms} bath</span>
															<span class="flex items-center gap-1"><Home class="h-3 w-3" />{p.sqft} sqft</span>
														</div>
														<p class="mt-1 font-semibold text-primary text-xs">{p.priceFormatted}</p>
													</div>
												{/if}
												{#if msg.options}
													<div class="mt-2 flex flex-col gap-1.5">
														{#each msg.options as opt}
															<button
																onclick={() => handleOptionClick(opt)}
																class="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-primary hover:text-primary transition-all"
															>
																{opt}
															</button>
														{/each}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>

								<!-- Input for name/phone/date steps -->
								{#if engineState.step === 'name' || engineState.step === 'phone' || engineState.step === 'inspection_date'}
									<form onsubmit={handleFormSubmit} class="flex gap-2">
										<Input
											type={engineState.step === 'inspection_date' ? 'date' : engineState.step === 'phone' ? 'tel' : 'text'}
											bind:value={inputValue}
											placeholder={getInputLabel(engineState.step)}
											required
											class="flex-1"
										/>
										<Button type="submit" size="sm">
											<Send class="h-4 w-4" />
										</Button>
									</form>
								{:else if engineState.step !== 'complete'}
									<div class="text-center text-xs text-slate-500">
										Pick an option above to continue the conversation.
									</div>
								{/if}
							</CardContent>
					</Card>
				</section>

				<!-- Lead capture form (appears after property is selected) -->
				<aside class="space-y-6">
					{#if engineState.step === 'name' || engineState.step === 'phone' || engineState.step === 'inspection_date'}
						<Card>
							<CardHeader>
								<CardTitle class="text-lg">Your Lead Details</CardTitle>
								<CardDescription>The chatbot collected your property interest. Just confirm your details.</CardDescription>
							</CardHeader>
							<CardContent>
								<form onsubmit={handleLeadCapture} class="space-y-3">
									<div>
										<label for="lead-name" class="block text-xs font-medium text-slate-600">Full Name</label>
										<Input id="lead-name" type="text" required placeholder="John Doe" />
									</div>
									<div>
										<label for="lead-phone" class="block text-xs font-medium text-slate-600">Phone</label>
										<Input id="lead-phone" type="tel" required placeholder="+234 803 000 0000" />
									</div>
									<div>
										<label for="lead-email" class="block text-xs font-medium text-slate-600">Email (optional)</label>
										<Input id="lead-email" type="email" placeholder="you@business.com" />
									</div>
									{#if leadError}
										<p class="text-xs text-destructive">{leadError}</p>
									{/if}
									<Button type="submit" disabled={isSubmitting} class="w-full">
										{isSubmitting ? 'Submitting...' : 'Capture Lead'}
									</Button>
								</form>
							</CardContent>
						</Card>
					{:else if engineState.step === 'property_detail'}
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
							<div class="mb-2 text-3xl"><Home class="h-8 w-8 text-primary" /></div>
							<p class="text-sm text-slate-600">
								Select a property in the chat to unlock the lead capture form.
							</p>
						</div>
					{:else}
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
							<div class="mb-2 text-3xl"><MessageCircle class="h-8 w-8 text-muted-foreground/30" /></div>
							<p class="text-sm text-slate-600">
								Start the conversation to see the lead capture flow in action.
							</p>
						</div>
					{/if}
				</aside>
			</div>

			<!-- Preview: how the lead looks when it arrives -->
			<section class="mt-12">
				<h2 class="mb-4 text-lg font-semibold text-foreground">How the lead arrives to your real estate team</h2>
				<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					{#if engineState.selectedProperty}
						{@const prop = engineState.selectedProperty}
						{@const scoreObj = scoreLeadFromState(engineState)}
						<div class="flex items-start gap-3">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<User class="h-4 w-4 text-primary" />
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium text-sm text-foreground">{engineState.name || 'John Doe'}</span>
									<span class="rounded-full {scoreObj.tier === 'hot' ? 'bg-green-100 text-green-800' : scoreObj.tier === 'warm' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'} px-2 py-0.5 text-[10px] font-medium">
										{scoreObj.tier === 'hot' ? 'Hot Lead' : scoreObj.tier === 'warm' ? 'Warm Lead' : 'Cold Lead'}
									</span>
								</div>
								<p class="text-xs text-muted-foreground">
									Interested in: {engineState.propertyType === 'buy' ? 'Buying' : 'Renting'} a {prop.bedrooms}-Bedroom {prop.title} in {LOCATION_LABELS[engineState.location || 'wuse']} - {prop.priceFormatted}
								</p>
								<div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
									<span class="flex items-center gap-1.5"><Phone class="h-3 w-3" />{engineState.phone || '+234 803 456 7890'}</span>
									<span class="flex items-center gap-1.5"><Calendar class="h-3 w-3" />Inspection: {formatDate(engineState.inspectionDate) || 'TBD'}</span>
									<span class="flex items-center gap-1.5"><MapPin class="h-3 w-3" />{LOCATION_LABELS[engineState.location || 'wuse']}, Abuja</span>
									<span class="flex items-center gap-1.5"><CheckCircle2 class="h-3 w-3" />Lead score: {scoreObj.score}/100</span>
								</div>
							</div>
						</div>
					{:else}
						<div class="flex items-start gap-3">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<User class="h-4 w-4 text-primary" />
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium text-sm text-foreground">Sarah Okonkwo</span>
									<span class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">Hot Lead</span>
								</div>
								<p class="text-xs text-muted-foreground">
									Interested in: Buying a 4-Bedroom Detached House in Maitama - ₦450,000,000
								</p>
								<div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
									<span class="flex items-center gap-1.5"><Phone class="h-3 w-3" />+234 803 456 7890</span>
									<span class="flex items-center gap-1.5"><Calendar class="h-3 w-3" />Wishlist: 2 Oct 2025</span>
									<span class="flex items-center gap-1.5"><MapPin class="h-3 w-3" />Maitama, Abuja</span>
									<span class="flex items-center gap-1.5"><CheckCircle2 class="h-3 w-3" />Lead score: 85/100</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
				<p class="mt-2 text-xs text-slate-500">
					This is a demo preview. When you complete the flow above, we send the same structured data to your
					CRM via EmailJS and persist it to Supabase.
				</p>
			</section>
		{:else}
			<!-- Lead submitted confirmation -->
			<div class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
				<div class="mb-4 text-4xl"><CheckCircle2 class="h-10 w-10 text-green-600" /></div>
				<h2 class="mb-2 text-2xl font-bold text-green-800">Lead Captured!</h2>
				{#if leadReceived}
					<p class="mb-4 text-sm text-green-700">
						Thank you, {leadReceived.name}. A RyderTech real estate specialist will contact you at
						{leadReceived.phone} to confirm your inspection.
					</p>
					<div class="mt-6 max-w-sm rounded-lg border border-green-200 bg-white p-4 text-left">
						<p class="text-xs text-slate-500">Lead details:</p>
						<p class="font-medium text-sm">Property: {leadReceived.propertyTitle}</p>
						<p class="text-xs text-slate-600">Location: {leadReceived.location}</p>
						<p class="text-xs text-slate-600">Interest: {leadReceived.propertyType === 'buy' ? 'Buying' : 'Renting'}</p>
						<p class="text-xs text-slate-600">Score: {leadReceived.leadScore}/100 ({leadReceived.leadTier})</p>
					</div>
				{/if}
				<button onclick={resetChatbot} class="mt-4 text-sm font-medium text-primary underline">
					Run another demo
				</button>
			</div>
		{/if}

		<!-- FAQ Section for SEO -->
		<section class="mt-20 max-w-3xl mx-auto" aria-labelledby="faq-heading">
			<h2 id="faq-heading" class="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
			<div class="space-y-4">
				<details class="group bg-white rounded-lg border border-slate-200 p-4">
					<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
						Is this a real property listing?
						<span class="transition group-open:rotate-180">▼</span>
					</summary>
					<p class="mt-2 text-sm text-slate-600">
						This is a demo tool built by RyderTech to showcase how our chatbots can capture qualified
						leads for real estate businesses. The property data is simulated for demonstration purposes.
					</p>
				</details>
				<details class="group bg-white rounded-lg border border-slate-200 p-4">
					<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
						Can I integrate this with my CRM?
						<span class="transition group-open:rotate-180">▼</span>
					</summary>
					<p class="mt-2 text-sm text-slate-600">
						We build real chatbots that integrate with any CRM (HubSpot, Salesforce, Airtable, Zoho, or
						custom webhooks). The lead data is structured JSON ready for any pipeline.
					</p>
				</details>
				<details class="group bg-white rounded-lg border border-slate-200 p-4">
					<summary class="font-semibold text-blue-600 cursor-pointer list-none flex justify-between items-center">
						What data do you collect?
						<span class="transition group-open:rotate-180">▼</span>
					</summary>
					<p class="mt-2 text-sm text-slate-600">
						Only the lead details you enter (name, phone, email, inspection preference). We never sell
						data. See our <a href="/privacy" class="text-primary underline">Privacy Policy</a> for details.
					</p>
				</details>
			</div>
		</section>

		<!-- Footer -->
		<footer class="border-t border-border mt-20 py-8 text-center text-slate-500 text-sm">
			<p>Powered by RyderTech Labs - AI chatbots for real estate lead generation</p>
		</footer>
	</div>
</div>

<style>
	/* Keep chat messages from wrapping awkwardly on the input area */
	@media (max-width: 768px) {
		.container {
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}
</style>
