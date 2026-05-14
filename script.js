/* =========================================================
   LB MUN 2026 — Main JavaScript
   ========================================================= */

/* ── 1. NAVBAR SCROLL EFFECT ───────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const SCROLL_THRESHOLD = 50;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load in case page is already scrolled
})();


/* ── 2. HAMBURGER / MOBILE NAV ─────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const links     = navLinks.querySelectorAll('.nav-link');

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close nav when any link is tapped
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close nav when resizing past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });
})();


/* ── 3. COUNTDOWN TIMER ────────────────────────────────── */
(function initCountdown() {
  const TARGET_DATE = new Date('June 1, 2026 09:00:00').getTime();

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  /**
   * Pads a number to 2 digits.
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  /**
   * Updates the countdown DOM elements.
   */
  function updateCountdown() {
    const now  = Date.now();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      // Conference has started — show zeros and stop
      daysEl.textContent    = '00';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      clearInterval(timerInterval);

      // Optionally update the label
      const label = document.querySelector('.countdown-label');
      if (label) label.textContent = 'Conference is live!';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent    = pad(days);
    hoursEl.textContent   = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  // Run immediately, then every second
  let timerInterval;
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
})();


/* ── 4. MODAL LOGIC ────────────────────────────────────── */
(function initModals() {

  /**
   * Opens a modal by its element or id string.
   * @param {HTMLElement|string} target
   */
  function openModal(target) {
    const modal = typeof target === 'string'
      ? document.getElementById(target)
      : target;

    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Move focus to the close button for accessibility
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Closes a modal by its element or id string.
   * @param {HTMLElement|string} target
   */
  function closeModal(target) {
    const modal = typeof target === 'string'
      ? document.getElementById(target)
      : target;

    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Closes all open modals.
   */
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
  }

  // ── Attach click listeners to every committee card ──
  document.querySelectorAll('.committee-card[data-modal], .community-card[data-modal]').forEach(card => {
    const modalId = card.dataset.modal;

    // Click
    card.addEventListener('click', () => openModal(modalId));

    // Keyboard (Enter / Space) for accessibility
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(modalId);
      }
    });
  });

  // ── Attach close button listeners ──
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      closeModal(modal);
    });
  });

  // ── Close modal when clicking outside the content box ──
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // ── Close modal on Escape key ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
})();


/* ── 5. STAR FIELD ANIMATION ───────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars  = [];
  let animId;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.0015 + 0.0005,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      const a = star.alpha * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(183, 148, 246, ${a})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }

  // Respect prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { canvas.style.display = 'none'; return; }

  resize();
  animId = requestAnimationFrame(draw);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
})();


/* ── 6. SMOOTH REVEAL ON SCROLL (Intersection Observer) ── */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.committee-card, .community-card, .letter-card, .stat-item, .apply-text, .section-header'
  );

  const style = document.createElement('style');
  style.textContent = `
    .reveal-hidden {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .reveal-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  targets.forEach((el, i) => {
    el.classList.add('reveal-hidden');
    // Stagger cards in the committees/stats grid
    const delay = (i % 6) * 0.08;
    el.style.transitionDelay = `${delay}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target); // Fire once
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ── 7. ACTIVE NAV LINK HIGHLIGHT (scroll spy) ─────────── */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
  const NAV_H    = 80;

  function onScroll() {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= NAV_H + 10) current = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--accent)' : '';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── 8. APPLICATION FORM HANDLER ────────────────────────── */
(function initApplicationForm() {
  const form = document.getElementById('application-form');
  const statusDiv = document.getElementById('form-status');
  const experienceRadio = document.querySelectorAll('input[name="experience"]');
  const experienceDetails = document.getElementById('experience-details');

  // Show/hide experience details based on radio selection
  experienceRadio.forEach(radio => {
    radio.addEventListener('change', () => {
      if (experienceDetails) {
        experienceDetails.style.display = radio.value === 'yes' ? 'block' : 'none';
      }
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    // Get submit button
    const submitBtn = form.querySelector('button[type="submit"]');

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      // Prepare form data
      const formData = new FormData(form);
      const searchParams = new URLSearchParams();

      // Add all form fields
      formData.forEach((value, key) => {
        searchParams.append(key, value);
      });

      // Add timestamp and ID
      searchParams.append('timestamp', new Date().toISOString());
      searchParams.append('applicationId', 'LB' + Date.now());

      // Log data (for debugging)
      console.log('Submitting application data:', Object.fromEntries(searchParams));

      // Google Apps Script URL
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmgUn4itBQI7hvX_XxgA8R8T9mfbff7sKr2TlXx9M1Sz3mplO9Ja41-d0jrlpkYXsBdA/exec';

      // Send data to Google Sheets
      // Note: Google Apps Script requires no-cors mode for cross-origin requests
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: searchParams
      });

      // Success - even with no-cors, we assume it worked if no error
      statusDiv.className = 'form-status success';
      statusDiv.textContent = 'Your application has been submitted successfully! Thank you.';
      form.reset();
      if (experienceDetails) {
        experienceDetails.style.display = 'none';
      }
      
    } catch (error) {
      // Error handling
      console.error('Form submission error:', error);
      statusDiv.className = 'form-status error';
      
      // Specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        statusDiv.textContent = 'Network error! Please check your internet connection and try again.';
      } else {
        statusDiv.textContent = 'An error occurred! Please try again later.';
      }
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });
})();


/* ── 7. ACTIVE NAV LINK HIGHLIGHT (scroll spy) ─────────── */
