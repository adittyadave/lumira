import { auth } from './auth.js';
import { initTools } from './tools.js';
import { initThreeScene } from './three-scene.js';
import '../styles/index.css';

// ── Three.js Hero Scene ──
initThreeScene();

// ── Navbar scroll effect ──
const sections = document.querySelectorAll('section[id]');
function onScroll() {
  const scrollY = window.scrollY;
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--cta)');
  let currentSection = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (scrollY >= top) currentSection = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('navHamburger');
    if (navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// ── Mobile hamburger ──
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.anim-reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

// ── Counter animation ──
const statNumbers = document.querySelectorAll('.stat-number[data-count]');
if (statNumbers.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const startTime = performance.now();
        const startVal = 0;
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startVal + (target - startVal) * eased);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => counterObserver.observe(el));
}

// ── Pricing Toggle ──
const pricingSwitch = document.getElementById('pricingSwitch');
const pricingAmounts = document.querySelectorAll('.pricing-amount');
const pricingCycles = document.querySelectorAll('.pricing-cycle');
const labelMonthly = document.getElementById('label-monthly');
const labelAnnual = document.getElementById('label-annual');
if (pricingSwitch) {
  pricingSwitch.addEventListener('click', () => {
    const isAnnual = pricingSwitch.classList.toggle('pricing-switch--annual');
    labelMonthly.classList.toggle('pricing-toggle-label--active', !isAnnual);
    labelAnnual.classList.toggle('pricing-toggle-label--active', isAnnual);
    pricingAmounts.forEach(el => {
      const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
      el.textContent = val;
    });
    pricingCycles.forEach(el => {
      el.textContent = isAnnual ? '/year' : '/month';
    });
  });
}

// ── Button ripple ──
document.querySelectorAll('.btn--primary, .btn--nav-dashboard, .btn--royal').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Initialize Auth and Tools
auth.init();
initTools();
