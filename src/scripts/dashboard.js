import { supabase } from './supabase.js';
import { initDashboardTools } from './tools.js';
import '../styles/index.css';

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    window.location.href = 'index.html?auth=required';
    return;
  }

  // Load user data
  const user = session.user;
  const name = user.user_metadata.full_name || user.email.split('@')[0];
  
  const welcomeName = document.getElementById('welcomeName');
  if (welcomeName) welcomeName.textContent = name;

  const navUserName = document.getElementById('navUserName');
  if (navUserName) navUserName.textContent = name;
  
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar && user.user_metadata.full_name) {
    navAvatar.textContent = user.user_metadata.full_name.charAt(0).toUpperCase();
  }

  // Fetch profile for credits/tier
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      const credits = profile.credits ?? 50;
      const tier = profile.subscription_tier || 'starter';
      const maxCredits = tier === 'starter' ? 50 : tier === 'pro' ? 500 : 2000;
      
      const creditCount = document.getElementById('creditCount');
      if (creditCount) creditCount.textContent = credits.toLocaleString();

      const planTier = document.getElementById('planTier');
      if (planTier) planTier.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);

      const creditBar = document.getElementById('creditBar');
      if (creditBar) creditBar.style.width = `${Math.min(100, (credits / maxCredits) * 100)}%`;
      
      // Plan status sidebar
      const planStatusLabel = document.getElementById('planStatusLabel');
      if (planStatusLabel) planStatusLabel.textContent = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Active`;

      const planStatusSub = document.getElementById('planStatusSub');
      if (planStatusSub) {
        if (tier === 'starter') {
          planStatusSub.textContent = 'Upgrade for more credits';
        } else {
          planStatusSub.textContent = `${credits} credits remaining`;
        }
      }
    }

    // Count today's generations
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('tool_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today);
    
    const genCount = document.getElementById('genCount');
    if (genCount) genCount.textContent = (count || 0).toString();

  } catch (err) {
    console.error("Error loading profile:", err);
  }

  // Init tools
  initDashboardTools();

  // User dropdown toggle
  document.getElementById('navAvatarBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('active');
  });
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.remove('active');
  });
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});
