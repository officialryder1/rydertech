/**
 * propertyChatbot.ts - Engine for the "Property Match Lead-Gen" demo chatbot.
 * Pure TS only — no DOM, no network, no process.*. SSR-safe.
 *
 * Simulates a real-estate chatbot conversation that funnels a prospect
 * from property interest -> location -> property detail -> name -> phone ->
 * inspection date. Returns a structured lead object suitable for EmailJS
 * dispatch and Supabase persistence.
 */

export type PropertyType = 'buy' | 'rent';
export type LocationKey = 'wuse' | 'maitama' | 'gwarimpa' | 'asokoro' | 'area-1';
export type Property = {
	id: string;
	title: string;
	location: string;
	bedrooms: number;
	bathrooms: number;
	sqft: number;
	price: number;
	/** Naira-formatted price string */
	priceFormatted: string;
	image: string;
	description: string;
};

export type ConversationStep =
	| 'welcome'
	| 'property_type'
	| 'location'
	| 'property_detail'
	| 'name'
	| 'phone'
	| 'inspection_date'
	| 'complete';

export type Lead = {
	name: string;
	phone: string;
	email: string;
	propertyType: PropertyType;
	location: string;
	propertyId: string;
	propertyTitle: string;
	inspectionDate: string;
	leadScore: number;
	leadTier: 'cool' | 'warm' | 'hot';
};

export type ChatMessage = {
	role: 'assistant' | 'user';
	content: string;
	options?: string[];
	property?: Property;
	properties?: Property[];
	isComplete?: boolean;
	lead?: Lead;
};

export type EngineState = {
	step: ConversationStep;
	propertyType: PropertyType | null;
	location: LocationKey | null;
	selectedProperty: Property | null;
	name: string;
	phone: string;
	email: string;
	inspectionDate: string;
	messages: ChatMessage[];
};

// ---- Property catalogue (demo data for 5 Abuja locations) ----

const PROPERTIES: Record<LocationKey, Property[]> = {
	wuse: [
		{
			id: 'wuse-001',
			title: '3-Bedroom Semi-Detached Duplex',
			location: 'Wuse',
			bedrooms: 3,
			bathrooms: 3,
			sqft: 1800,
			price: 180000000,
			priceFormatted: '₦180,000,000',
			image: '/images/properties/wuse-duplex.jpg',
			description: 'Well-structured duplex in a quiet Wuse cul-de-sac. 3 bedrooms all en-suite, fitted kitchen, 2-car garage, garden. Title: Deed of Assignment.'
		},
		{
			id: 'wuse-002',
			title: '2-Bedroom Apartment',
			location: 'Wuse',
			bedrooms: 2,
			bathrooms: 2,
			sqft: 1200,
			price: 95000000,
			priceFormatted: '₦95,000,000',
			image: '/images/properties/wuse-apt.jpg',
			description: 'Modern 2-bedroom apartment on the 3rd floor of a serviced building. Swimming pool, gym, security. Title: C of O.'
		}
	],
	maitama: [
		{
			id: 'maitama-001',
			title: '4-Bedroom Detached House',
			location: 'Maitama',
			bedrooms: 4,
			bathrooms: 5,
			sqft: 4200,
			price: 450000000,
			priceFormatted: '₦450,000,000',
			image: '/images/properties/maitama-house.jpg',
			description: 'Spacious detached house on 2 plots. 4 bedrooms, all en-suite, staff quarters, swimming pool, generator house. Title: Deed of Assignment.'
		}
	],
	gwarimpa: [
		{
			id: 'gwarimpa-001',
			title: '3-Bedroom Terrace',
			location: 'Gwagwalada',
			bedrooms: 3,
			bathrooms: 3,
			sqft: 2000,
			price: 120000000,
			priceFormatted: '₦120,000,000',
			image: '/images/properties/gwarimpa-terrace.jpg',
			description: 'Newly built 3-bedroom terrace. En-suite rooms, fitted kitchen cabinets, balcony with city view. Title: C of O.'
		},
		{
			id: 'gwarimpa-002',
			title: '2-Bedroom Apartment',
			location: 'Gwagwalada',
			bedrooms: 2,
			bathrooms: 2,
			sqft: 1100,
			price: 75000000,
			priceFormatted: '₦75,000,000',
			image: '/images/properties/gwarimpa-apt.jpg',
			description: "2-bedroom apartment in a gated estate. Covered parking, children's play area, gym. Title: Excise."
		}
	],
	asokoro: [
		{
			id: 'asokoro-001',
			title: '3-Bedroom Semi-Detached',
			location: 'Asokoro',
			bedrooms: 3,
			bathrooms: 3,
			sqft: 1900,
			price: 200000000,
			priceFormatted: '₦200,000,000',
			image: '/images/properties/asokoro-semi.jpg',
			description: 'Elegant semi-detached house in diplomatic zone. 3 en-suite bedrooms, executive lounge, landscaped compound. Title: Deed of Assignment.'
		}
	],
	'area-1': [
		{
			id: 'area1-001',
			title: '2-Bedroom Apartment',
			location: 'Area 1',
			bedrooms: 2,
			bathrooms: 2,
			sqft: 1000,
			price: 65000000,
			priceFormatted: '₦65,000,000',
			image: '/images/properties/area1-apt.jpg',
			description: 'Cozy 2-bedroom apartment near the district park. Close to shopping, easy access to major roads. Title: C of O.'
		}
	]
};

const LOCATION_LABELS: Record<LocationKey, string> = {
	wuse: 'Wuse',
	maitama: 'Maitama',
	gwarimpa: 'Gwarimpa/Gwagwalada',
	asokoro: 'Asokoro',
	'area-1': 'Area 1 District'
};

// ---- Initial state ----

export function initialState(): EngineState {
	return {
		step: 'property_type',
		propertyType: null,
		location: null,
		selectedProperty: null,
		name: '',
		phone: '',
		email: '',
		inspectionDate: '',
		messages: [
			{
				role: 'assistant',
				content: 'Hi there! I am Ryder, your property assistant. I can help you find properties for sale or rent in prime Abuja locations.',
				options: ['Buy Land/Property', 'Rent a Property']
			}
		]
	};
}

// ---- Engine functions ----

/**
 * Called when the user picks "Buy" or "Rent".
 * Returns the next state and the assistant message.
 */
export function selectPropertyType(state: EngineState, type: PropertyType): EngineState {
	let newState = { ...state, propertyType: type };

	const typeLabel = type === 'buy' ? 'buying' : 'renting';
	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: type === 'buy' ? 'Buy Land/Property' : 'Rent a Property'
			},
		{
				role: 'assistant',
				content: `Great! I see you're interested in ${typeLabel}. Which location would you like to explore?`,
				options: Object.values(LOCATION_LABELS)
			}
		];

	return { ...newState, step: 'location' };
}

/**
 * Called when the user picks a location.
 * Returns the next state with property list.
 */
export function selectLocation(state: EngineState, location: LocationKey): EngineState {
	const properties = PROPERTIES[location];
	const locationLabel = LOCATION_LABELS[location];

	let newState = { ...state, location };

	const propertyOptions = properties.map((p) => `${p.title} - ${p.priceFormatted}`);

	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: locationLabel
			},
		{
				role: 'assistant',
				content: `Here are the available properties in ${locationLabel}:`,
				properties: properties,
				options: propertyOptions
			}
		];

	return { ...newState, step: 'property_detail' };
}

/**
 * Called when the user picks a specific property.
 * Returns the next state.
 */
export function selectProperty(state: EngineState, propertyId: string): EngineState {
	const property = Object.values(PROPERTIES)
		.flat()
		.find((p) => p.id === propertyId);

	if (!property) {
		return state;
	}

	let newState = { ...state, selectedProperty: property };

	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: property.title
			},
		{
				role: 'assistant',
				content: `${property.title}\n\n${property.description}\n\n${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft.toLocaleString()} sqft\n${property.priceFormatted}`,
				property: property
			}
		];

	return { ...newState, step: 'name' };
}

/**
 * Called when the user enters their name.
 */
export function enterName(state: EngineState, name: string): EngineState {
	const newState = { ...state, name };
	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: name
			},
		{
				role: 'assistant',
				content: `Nice to meet you, ${name}! What is your phone number? We will use it to send you property updates and schedule inspection.`
			}
		];
	return { ...newState, step: 'phone' };
}

/**
 * Called when the user enters their phone.
 */
export function enterPhone(state: EngineState, phone: string): EngineState {
	const newState = { ...state, phone };
	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: phone
			},
		{
				role: 'assistant',
				content: 'When would you like to inspect this property? Please pick a date.'
			}
		];
	return { ...newState, step: 'inspection_date' };
}

/**
 * Called when the user picks an inspection date.
 * Completes the lead and returns the final state with lead object.
 */
export function enterInspectionDate(state: EngineState, date: string): EngineState {
	const newState = { ...state, inspectionDate: date };

	const lead = buildLead(newState);

	newState.messages = [
		...state.messages,
		{
				role: 'user',
				content: formatDate(date)
			},
		{
				role: 'assistant',
				content: `Thank you, ${newState.name}! Your property inquiry has been submitted. A RyderTech real estate specialist will contact you at ${newState.phone} to confirm your inspection on ${formatDate(date)} for ${newState.selectedProperty?.title}.`,
				lead: lead,
				isComplete: true
			}
		];

	return { ...newState, step: 'complete' };
}

/**
 * Build the final lead object for dispatch.
 */
export function buildLead(state: EngineState): Lead {
	const property = state.selectedProperty!;
	const locationLabel = state.location ? LOCATION_LABELS[state.location] : 'Unknown';

	let leadScore = 50;
	if (state.propertyType === 'buy') leadScore += 20;
	if (state.name && state.name.length > 3) leadScore += 10;
	if (state.phone && state.phone.length >= 10) leadScore += 15;
	if (state.inspectionDate) leadScore += 15;

	const scoreMap: Record<number, 'hot' | 'warm' | 'cool'> = {
		90: 'hot',
		60: 'warm',
		0: 'cool'
	};

	let tier: 'hot' | 'warm' | 'cool' = 'cool';
	if (leadScore >= 80) tier = 'hot';
	else if (leadScore >= 55) tier = 'warm';

	return {
		name: state.name,
		phone: state.phone,
		email: state.email,
		propertyType: state.propertyType!,
		location: locationLabel,
		propertyId: property.id,
		propertyTitle: property.title,
		inspectionDate: state.inspectionDate,
		leadScore,
		leadTier: tier
	};
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Get a random sample phone number for the demo lead preview.
 * Not used in production - only for the demo preview display.
 */
export function getSampleLead(): Lead {
	return {
		name: 'Sarah Okonkwo',
		phone: '+234 803 456 7890',
		email: 'sarah.okonkwo@example.com',
		propertyType: 'buy',
		location: 'Maitama',
		propertyId: 'maitama-001',
		propertyTitle: '4-Bedroom Detached House',
		inspectionDate: '2025-10-28',
		leadScore: 85,
		leadTier: 'hot'
	};
}

/**
 * Get the property catalogue for display.
 */
export function getProperties(): Record<LocationKey, Property[]> {
	return PROPERTIES;
}

/**
 * Get location labels.
 */
export function getLocationLabels(): Record<LocationKey, string> {
	return LOCATION_LABELS;
}