// ============================================
// Werkwijze Page — Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile nav ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Timeline fill on scroll ---
  const timelineFill = document.getElementById('timelineFill');
  const timelineSection = document.querySelector('.wk-timeline');

  if (timelineFill && timelineSection) {
    const updateTimeline = () => {
      const rect = timelineSection.getBoundingClientRect();
      const windowH = window.innerHeight;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Calculate progress from when timeline enters viewport to when it's fully scrolled
      const scrollStart = windowH * 0.6;
      const progress = Math.max(0, Math.min(1, (scrollStart - sectionTop) / sectionHeight));
      timelineFill.style.height = (progress * 100) + '%';
    };

    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  // --- FAQ accordion ---
  const faqItems = document.querySelectorAll('.wk-faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.wk-faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => other.classList.remove('open'));

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      } else {
        question.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
