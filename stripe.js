/* ═══════════════════════════════════════════
   Lumira — Stripe Payment Module
   ═══════════════════════════════════════════ */

(() => {
  'use strict';

  // ─── CONFIGURATION ───
  // Replace with your actual Stripe keys
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_KEY_HERE';
  const PRO_PRICE_ID = 'price_PRO_ID_HERE';
  const MAX_PRICE_ID = 'price_MAX_ID_HERE';
  const SUCCESS_URL = window.location.origin + '?payment=success';
  const CANCEL_URL = window.location.origin + '?payment=canceled';

  let stripeInstance = null;

  // ─── Initialize Stripe ───
  function getStripe() {
    if (!stripeInstance && window.Stripe) {
      stripeInstance = window.Stripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripeInstance;
  }

  // ─── Create Checkout Session via Supabase Edge Function ───
  async function createCheckoutSession(userEmail, priceId) {
    const sb = window.lumiraSupabase;
    if (!sb) throw new Error('Supabase not initialized');

    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Please sign in first');

    // Call Supabase Edge Function to create Stripe checkout session
    const { data, error } = await sb.functions.invoke('create-checkout', {
      body: {
        priceId: priceId,
        email: userEmail,
        userId: session.user.id,
        successUrl: SUCCESS_URL,
        cancelUrl: CANCEL_URL
      }
    });

    if (error) throw error;
    return data;
  }

  // ─── Redirect to Checkout ───
  async function redirectToCheckout(requestedTier = 'pro') {
    const auth = window.lumiraAuth;
    if (!auth || !auth.isLoggedIn()) {
      auth?.openModal('login');
      auth?.showToast(`Please sign in to upgrade to ${requestedTier.toUpperCase()}`, 'info');
      return;
    }

    const currentTier = auth.getTier();
    if (currentTier === requestedTier || (currentTier === 'max' && requestedTier === 'pro')) {
      auth.showToast(`You already have ${requestedTier.toUpperCase()} access!`, 'info');
      return;
    }

    const priceId = requestedTier === 'max' ? MAX_PRICE_ID : PRO_PRICE_ID;

    const profile = auth.getProfile();

    // Show loading state
    upgradeButtons.forEach(btn => {
      if (btn.dataset.tier === requestedTier) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn-loader"></span> Redirecting...';
      }
    });

    try {
      const { sessionUrl } = await createCheckoutSession(profile.email, priceId);
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);

      // Fallback: Use Stripe Payment Link (no backend needed)
      // The user can create a Payment Link in Stripe Dashboard and paste it here
      const PAYMENT_LINK = ''; // e.g., 'https://buy.stripe.com/test_xxx'
      if (PAYMENT_LINK) {
        const url = new URL(PAYMENT_LINK);
        url.searchParams.set('prefilled_email', profile.email);
        window.location.href = url.toString();
      } else {
        auth.showToast('Payment setup in progress. Please try again later.', 'error');
      }

      // Reset buttons
      upgradeButtons.forEach(btn => {
        btn.disabled = false;
        const tier = btn.dataset.tier || 'pro';
        btn.innerHTML = `<span>Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}</span>`;
      });
    }
  }

  // ─── Handle Payment Return ───
  function handlePaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    const auth = window.lumiraAuth;

    if (params.get('payment') === 'success') {
      if (auth) {
        auth.showToast('🎉 Welcome to Lumira Pro! Your account is being upgraded...', 'success');
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('payment') === 'canceled') {
      if (auth) {
        auth.showToast('Payment was canceled. No charges were made.', 'info');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // ─── Init ───
  function init() {
    getStripe();
    handlePaymentReturn();

    // Bind upgrade buttons
    document.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        redirectToCheckout(btn.dataset.tier);
      });
    });

    // Bind card lock overlays
    document.querySelectorAll('.pro-lock-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        const auth = window.lumiraAuth;
        const card = overlay.closest('.feature-card');
        const requiredTier = card.classList.contains('feature-card--max') ? 'max' : 'pro';

        if (auth && !auth.isLoggedIn()) {
          auth.openModal('signup');
        } else {
          redirectToCheckout(requiredTier);
        }
      });
    });
  }

  // ─── Expose API ───
  window.lumiraStripe = {
    init,
    redirectToCheckout
  };

})();
