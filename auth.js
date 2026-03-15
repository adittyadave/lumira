/* ═══════════════════════════════════════════
   Lumira — Auth Module
   ═══════════════════════════════════════════ */

(() => {
  'use strict';

  let currentUser = null;
  let currentProfile = null;

  // ─── DOM Elements ───
  const modal = () => document.getElementById('authModal');
  const overlay = () => document.getElementById('authOverlay');
  const authTabs = () => document.querySelectorAll('.auth-tab');
  const loginForm = () => document.getElementById('loginForm');
  const signupForm = () => document.getElementById('signupForm');
  const loginPanel = () => document.getElementById('loginPanel');
  const signupPanel = () => document.getElementById('signupPanel');
  const authError = () => document.getElementById('authError');
  const navAuthBtn = () => document.getElementById('navAuthBtn');
  const navUserMenu = () => document.getElementById('navUserMenu');
  const navAvatar = () => document.getElementById('navAvatar');
  const navUserName = () => document.getElementById('navUserName');
  const navTierBadge = () => document.getElementById('navTierBadge');
  const userDropdown = () => document.getElementById('userDropdown');
  const logoutBtn = () => document.getElementById('logoutBtn');

  // ─── Supabase client ───
  function getSupabase() {
    return window.lumiraSupabase;
  }

  // ─── Modal Control ───
  function openAuthModal(tab = 'login') {
    const m = modal();
    if (!m) return;
    m.classList.add('active');
    overlay().classList.add('active');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
    clearError();
  }

  function closeAuthModal() {
    const m = modal();
    if (!m) return;
    m.classList.remove('active');
    overlay().classList.remove('active');
    document.body.style.overflow = '';
    clearError();
  }

  function switchTab(tab) {
    authTabs().forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    const lp = loginPanel();
    const sp = signupPanel();
    if (lp) lp.style.display = tab === 'login' ? 'block' : 'none';
    if (sp) sp.style.display = tab === 'signup' ? 'block' : 'none';
  }

  function showError(msg) {
    const el = authError();
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function clearError() {
    const el = authError();
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  function setLoading(form, loading) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = loading;
      btn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
      btn.querySelector('.btn-loader').style.display = loading ? 'inline-block' : 'none';
    }
  }

  // ─── Auth Actions ───
  async function signUp(email, password, fullName) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signInWithGoogle() {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const sb = getSupabase();
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    currentUser = null;
    currentProfile = null;
    updateNavUI();
    updateFeatureGating(false);
    showToast('Signed out successfully');
  }

  // ─── Profile ───
  async function fetchProfile(userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('profiles')
      .select('*, subscriptions(*)')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }
    return data;
  }

  // ─── UI Updates ───
  function updateNavUI() {
    const authBtn = navAuthBtn();
    const userMenu = navUserMenu();

    if (currentUser && currentProfile) {
      // Logged in
      if (authBtn) authBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';

      const avatar = navAvatar();
      const name = navUserName();
      const proBadge = navProBadge();

      if (avatar) {
        const initial = (currentProfile.full_name || currentProfile.email || '?')[0].toUpperCase();
        if (currentProfile.avatar_url) {
          avatar.innerHTML = `<img src="${currentProfile.avatar_url}" alt="Avatar">`;
        } else {
          avatar.textContent = initial;
        }
      }
      if (name) name.textContent = currentProfile.full_name || currentProfile.email?.split('@')[0] || 'User';
      const tierBadge = navTierBadge();
      if (tierBadge) {
        const tier = currentProfile.subscription_tier || 'starter';
        if (tier === 'starter') {
          tierBadge.style.display = 'none';
        } else {
          tierBadge.style.display = 'inline-block';
          tierBadge.textContent = tier.toUpperCase();
          tierBadge.className = `badge badge--${tier}`;
        }
      }
    } else {
      // Logged out
      if (authBtn) authBtn.style.display = 'inline-flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  function updateFeatureGating(tier = 'starter') {
    document.querySelectorAll('.feature-card').forEach(card => {
      const isProCard = card.classList.contains('feature-card--pro');
      const isMaxCard = card.classList.contains('feature-card--max');
      const lockOverlay = card.querySelector('.pro-lock-overlay');
      const lockText = lockOverlay ? lockOverlay.querySelector('span') : null;

      if (!lockOverlay) return;

      if (isMaxCard) {
        const hasAccess = tier === 'max';
        lockOverlay.style.display = hasAccess ? 'none' : 'flex';
        if (lockText) lockText.textContent = 'Unlock with Max';
      } else if (isProCard) {
        const hasAccess = tier === 'pro' || tier === 'max';
        lockOverlay.style.display = hasAccess ? 'none' : 'flex';
        if (lockText) lockText.textContent = 'Unlock with Pro';
      } else {
        lockOverlay.style.display = 'none';
      }
    });

    // Update pricing buttons
    document.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
      const btnTier = btn.dataset.tier;
      if (tier === btnTier || (tier === 'max' && btnTier === 'pro')) {
        btn.textContent = '✓ Active';
        btn.classList.add('btn--active');
        btn.disabled = true;
      } else {
        btn.disabled = false;
        btn.classList.remove('btn--active');
        if (btnTier === 'pro') btn.textContent = 'Upgrade to Pro';
        if (btnTier === 'max') btn.textContent = 'Upgrade to Max';
      }
    });
  }

  // ─── Toast Notifications ───
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ─── Event Listeners ───
  function initAuth() {
    const sb = getSupabase();
    if (!sb) {
      console.warn('Supabase client not initialized');
      return;
    }

    // Auth state listener
    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        currentProfile = await fetchProfile(session.user.id);
        closeAuthModal();
        updateNavUI();
        updateFeatureGating(currentProfile?.subscription_tier || 'starter');
        if (event === 'SIGNED_IN') {
          showToast(`Welcome${currentProfile?.full_name ? ', ' + currentProfile.full_name : ''}!`);
        }
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentProfile = null;
        updateNavUI();
        updateFeatureGating('starter');
      }
    });

    // Check existing session
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        currentUser = session.user;
        currentProfile = await fetchProfile(session.user.id);
        updateNavUI();
        updateFeatureGating(currentProfile?.subscription_tier || 'starter');
      }
    });

    // Login button in nav
    const authBtn = navAuthBtn();
    if (authBtn) {
      authBtn.addEventListener('click', (e) => {
        if (!currentUser) {
            e.preventDefault();
            openAuthModal('login');
        }
      });
    }

    // Close modal
    const closeBtn = document.getElementById('authModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
    const ov = overlay();
    if (ov) ov.addEventListener('click', closeAuthModal);

    // Check for auth requirement from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'required') {
        openAuthModal('login');
        showError('Please sign in to access your dashboard.');
    }

    // Tab switching
    authTabs().forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Login form
    const lf = loginForm();
    if (lf) {
      lf.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();
        setLoading(lf, true);
        try {
          const email = lf.querySelector('#loginEmail').value;
          const password = lf.querySelector('#loginPassword').value;
          await signIn(email, password);
        } catch (err) {
          showError(err.message || 'Login failed');
        } finally {
          setLoading(lf, false);
        }
      });
    }

    // Signup form
    const sf = signupForm();
    if (sf) {
      sf.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();
        setLoading(sf, true);
        try {
          const name = sf.querySelector('#signupName').value;
          const email = sf.querySelector('#signupEmail').value;
          const password = sf.querySelector('#signupPassword').value;
          await signUp(email, password, name);
          showToast('Check your email to confirm your account!', 'info');
          closeAuthModal();
        } catch (err) {
          showError(err.message || 'Signup failed');
        } finally {
          setLoading(sf, false);
        }
      });
    }

    // Google OAuth
    const googleBtns = document.querySelectorAll('[data-auth="google"]');
    googleBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await signInWithGoogle();
        } catch (err) {
          showError(err.message || 'Google sign-in failed');
        }
      });
    });

    // Logout
    const lb = logoutBtn();
    if (lb) {
      lb.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut();
      });
    }

    // User avatar dropdown toggle
    const avatarBtn = document.getElementById('navAvatarBtn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = userDropdown();
        if (dd) dd.classList.toggle('active');
      });
      document.addEventListener('click', () => {
        const dd = userDropdown();
        if (dd) dd.classList.remove('active');
      });
    }

    // All "Get Started" / login triggers
    document.querySelectorAll('[data-action="login"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
      });
    });

    document.querySelectorAll('[data-action="signup"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('signup');
      });
    });
  }

  // ─── Expose API ───
  window.lumiraAuth = {
    init: initAuth,
    openModal: openAuthModal,
    closeModal: closeAuthModal,
    signOut,
    getCurrentUser: () => currentUser,
    getProfile: () => currentProfile,
    isLoggedIn: () => !!currentUser,
    getTier: () => currentProfile?.subscription_tier || 'starter',
    hasAccess: (requiredTier) => {
        const tier = currentProfile?.subscription_tier || 'starter';
        if (requiredTier === 'max') return tier === 'max';
        if (requiredTier === 'pro') return tier === 'pro' || tier === 'max';
        return true;
    },
    showToast
  };

})();
