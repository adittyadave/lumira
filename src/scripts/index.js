import { auth } from './auth.js';
import { initTools } from './tools.js';
import '../styles/index.css';

// ── Particle Canvas ──
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    const hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.r = Math.random() * 1.8 + 0.4;
      this.dx = (Math.random() - 0.5) * 0.35;
      this.dy = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.1;
      const colors = ['0,212,255', '123,47,247', '255,107,157', '0,229,160'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
        this.reset();
        if (Math.random() > 0.5) {
          this.x = Math.random() > 0.5 ? -5 : w + 5;
          this.y = Math.random() * h;
        } else {
          this.y = Math.random() > 0.5 ? -5 : h + 5;
          this.x = Math.random() * w;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.min(Math.floor((w * h) / 8000), 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initParticles();
    }, 200);
  });
}

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
