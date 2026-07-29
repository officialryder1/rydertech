<!-- src/routes/affiliate/+page.svelte -->
<script>
  import {
    DollarSign,
    Users,
    TrendingUp,
    Award,
    Gift,
    CheckCircle,
    ArrowRight,
    Copy,
    Clock,
    Star,
    Zap,
    Shield,
    Target,
    BarChart3,
    Wallet,
    Calendar,
    Phone,
    Mail
  } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let referralLink = '';
  let copied = false;
  let showJoinModal = false;
  let stats = {
    clicks: 0,
    referrals: 0,
    conversions: 0,
    earnings: 0,
    pendingEarnings: 0,
    totalEarnings: 0
  };

  const commissionTiers = [
    { level: 'Bronze', referrals: '1-3', rate: '10%', bonus: '₦0', icon: '🥉' },
    { level: 'Silver', referrals: '4-7', rate: '12%', bonus: '₦50,000', icon: '🥈' },
    { level: 'Gold', referrals: '8-12', rate: '15%', bonus: '₦150,000', icon: '🥇' },
    { level: 'Platinum', referrals: '13+', rate: '20%', bonus: '₦500,000', icon: '💎' }
  ];

  const faqs = [
    {
      question: 'How do I become an affiliate?',
      answer: 'Simply click the "Join Now" button, fill in your details, and you\'ll get instant access to your affiliate dashboard and referral links.'
    },
    {
      question: 'When do I get paid?',
      answer: 'Commissions are paid within 7 days after the referred client makes their first payment. Payouts are made via bank transfer or mobile money.'
    },
    {
      question: 'What counts as a successful referral?',
      answer: 'A referral is counted when someone you referred signs up for any of our paid services and makes their first payment.'
    },
    {
      question: 'Is there a minimum payout?',
      answer: 'Yes, the minimum payout is ₦10,000. You can withdraw anytime you reach this threshold.'
    }
  ];

  onMount(() => {
    if (browser) {
      const userId = localStorage.getItem('rydertech_affiliate_id') || generateUserId();
      referralLink = `https://rydertech.com/ref/${userId}`;
      
      // Mock data - replace with actual API calls
      stats = {
        clicks: 234,
        referrals: 12,
        conversions: 5,
        earnings: 250000,
        pendingEarnings: 150000,
        totalEarnings: 400000
      };
    }
  });

  function generateUserId() {
    const id = Math.random().toString(36).substring(2, 15);
    if (browser) {
      localStorage.setItem('rydertech_affiliate_id', id);
    }
    return id;
  }

  function copyReferralLink() {
    navigator.clipboard.writeText(referralLink);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
  <!-- Hero Section -->
  <section class="pt-32 pb-20 px-4 bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
    </div>

    <div class="container mx-auto max-w-6xl relative z-10">
      <div class="text-center text-white">
        <!-- Badge -->
        <div class="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm font-semibold mb-6">
          <Gift class="w-4 h-4" />
          <span>AFFILIATE PROGRAM</span>
        </div>
        
        <!-- Main Heading -->
        <h1 class="text-4xl md:text-6xl font-black mb-6">
          Earn Up to <span class="text-[var(--secondary-light)]">₦1,000,000</span>
          <br />Per Month
        </h1>
        
        <!-- Subheading -->
        <p class="text-xl text-white/90 max-w-2xl mx-auto mb-10">
          Join Nigeria's fastest-growing tech affiliate program. Refer clients to RyderTech and earn huge commissions.
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on click={() => showJoinModal = true}
            class="px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            Join Affiliate Program
          </button>
          <a
            href="#how-it-works"
            class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            How It Works
          </a>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div class="text-center">
            <div class="text-3xl font-black mb-2">₦2.5M+</div>
            <div class="text-white/80 text-sm">Paid to Affiliates</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black mb-2">30+</div>
            <div class="text-white/80 text-sm">Active Affiliates</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black mb-2">10-20%</div>
            <div class="text-white/80 text-sm">Commission Rate</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-black mb-2">24h</div>
            <div class="text-white/80 text-sm">Fast Payouts</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black text-gray-900 mb-4">
          Why Join Our <span class="gradient-text">Affiliate Program?</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Everything you need to succeed as an affiliate partner
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
          <div class="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mb-6">
            <DollarSign class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">High Commissions</h3>
          <p class="text-gray-600">
            Earn up to 20% commission on every successful referral. Plus bonuses for high-performing affiliates.
          </p>
        </div>
        
        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
            <Clock class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Fast Payouts</h3>
          <p class="text-gray-600">
            Get paid within 7 days of client payment. No waiting months for your hard-earned commissions.
          </p>
        </div>
        
        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
            <Target class="w-8 h-8 text-purple-600" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Quality Products</h3>
          <p class="text-gray-600">
            Promote services you can be proud of. Our high conversion rates mean more earnings for you.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section id="how-it-works" class="py-20 px-4 bg-gray-50">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black text-gray-900 mb-4">
          How It <span class="gradient-text">Works</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Three simple steps to start earning
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center relative">
          <div class="absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hidden md:block"></div>
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-3xl font-black">1</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Sign Up Free</h3>
            <p class="text-gray-600">
              Create your affiliate account in minutes. No fees, no commitments.
            </p>
          </div>
        </div>
        
        <div class="text-center relative">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-3xl font-black">2</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Share Your Link</h3>
            <p class="text-gray-600">
              Share your unique referral link with friends, colleagues, and network.
            </p>
          </div>
        </div>
        
        <div class="text-center relative">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span class="text-white text-3xl font-black">3</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Get Paid</h3>
            <p class="text-gray-600">
              Earn commissions when your referrals become clients. Simple as that.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Commission Tiers -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black text-gray-900 mb-4">
          Commission <span class="gradient-text">Tiers</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          The more you refer, the more you earn
        </p>
      </div>
      
      <div class="grid md:grid-cols-4 gap-6">
        {#each commissionTiers as tier}
          <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[var(--primary)]/30 hover:shadow-xl transition-all">
            <div class="text-4xl mb-4">{tier.icon}</div>
            <h3 class="text-xl font-black text-gray-900 mb-2">{tier.level}</h3>
            <div class="text-3xl font-black text-[var(--primary)] mb-2">{tier.rate}</div>
            <div class="text-sm text-gray-500 mb-4">{tier.referrals} referrals</div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <span class="text-sm text-gray-600">Bonus:</span>
              <span class="font-bold text-gray-900">{tier.bonus}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Dashboard Preview -->
  <section class="py-20 px-4 bg-gray-50">
    <div class="container mx-auto max-w-6xl">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Content -->
        <div>
          <h2 class="text-4xl font-black text-gray-900 mb-6">
            Track Everything with Your
            <span class="gradient-text">Affiliate Dashboard</span>
          </h2>
          
          <p class="text-xl text-gray-600 mb-8">
            Get real-time insights into your performance, earnings, and referrals.
          </p>
          
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-1">Real-time Stats</h4>
                <p class="text-gray-600">Track clicks, conversions, and earnings in real-time</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-1">Easy Withdrawals</h4>
                <p class="text-gray-600">Withdraw your earnings directly to your bank account</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-1">Conversion Tracking</h4>
                <p class="text-gray-600">See exactly which referrals convert and how much you earn</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Content - Stats Card -->
        <div class="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-black text-gray-900">Your Dashboard</h3>
            <div class="px-3 py-1 bg-green-100 text-green-600 text-sm font-semibold rounded-full">
              Active
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div class="text-sm text-gray-600 mb-1">Total Clicks</div>
              <div class="text-2xl font-black text-gray-900">{stats.clicks}</div>
            </div>
            <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div class="text-sm text-gray-600 mb-1">Referrals</div>
              <div class="text-2xl font-black text-gray-900">{stats.referrals}</div>
            </div>
            <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div class="text-sm text-gray-600 mb-1">Conversions</div>
              <div class="text-2xl font-black text-gray-900">{stats.conversions}</div>
            </div>
            <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <div class="text-sm text-gray-600 mb-1">Earnings</div>
              <div class="text-2xl font-black text-gray-900">₦{stats.earnings.toLocaleString()}</div>
            </div>
          </div>
          
          <!-- Referral Link -->
          <div class="mb-6">
            <div class="text-sm text-gray-600 mb-2">Your Referral Link</div>
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                value={referralLink}
                readonly
                class="flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 text-sm"
              />
              <button
                on click={copyReferralLink}
                class="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
              >
                {#if copied}
                  <CheckCircle class="w-4 h-4" />
                {:else}
                  <Copy class="w-4 h-4" />
                {/if}
              </button>
            </div>
          </div>
          
          <button
            on click={() => showJoinModal = true}
            class="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Join Affiliate Program
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-20 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-black text-gray-900 mb-4">
          What Our <span class="gradient-text">Affiliates Say</span>
        </h2>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white rounded-2xl p-8 border border-gray-200">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center text-white font-black text-lg mr-4">
              CJ
            </div>
            <div>
              <div class="font-bold text-gray-900">Chidi Johnson</div>
              <div class="text-sm text-gray-500">Earned: ₦850,000</div>
            </div>
          </div>
          <p class="text-gray-600">
            "I've been with RyderTech for 6 months and earned over ₦850k. Best decision I made!"
          </p>
        </div>
        
        <div class="bg-white rounded-2xl p-8 border border-gray-200">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center text-white font-black text-lg mr-4">
              FA
            </div>
            <div>
              <div class="font-bold text-gray-900">Funmi Adebayo</div>
              <div class="text-sm text-gray-500">Earned: ₦1.2M</div>
            </div>
          </div>
          <p class="text-gray-600">
            "The recurring commissions are amazing! I keep getting paid for referrals from months ago."
          </p>
        </div>
        
        <div class="bg-white rounded-2xl p-8 border border-gray-200">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center text-white font-black text-lg mr-4">
              TO
            </div>
            <div>
              <div class="font-bold text-gray-900">Tunde Ola</div>
              <div class="text-sm text-gray-500">Earned: ₦2.1M</div>
            </div>
          </div>
          <p class="text-gray-600">
            "Top-tier support and fast payouts. They really care about their affiliates."
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="py-20 px-4 bg-gray-50">
    <div class="container mx-auto max-w-4xl">
      <h2 class="text-4xl font-black text-center text-gray-900 mb-12">
        Frequently Asked <span class="gradient-text">Questions</span>
      </h2>
      
      <div class="space-y-4">
        {#each faqs as faq}
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
            <p class="text-gray-600">{faq.answer}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="py-20 px-4 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
    <div class="container mx-auto max-w-4xl text-center">
      <h2 class="text-4xl font-black text-white mb-6">
        Ready to Start Earning?
      </h2>
      <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
        Join our affiliate program today and start earning commissions immediately.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on click={() => showJoinModal = true}
          class="px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg"
        >
          Join Now - It's Free
        </button>
        <a
          href="/contact"
          class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Phone class="w-5 h-5 mr-2" />
          Talk to Us
        </a>
      </div>
    </div>
  </section>
</div>

<style>
  .gradient-text {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>