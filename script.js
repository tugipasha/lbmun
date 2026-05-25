/* =========================================================
   LB MUN 2026 — Main JavaScript
   ========================================================= */

/* ── 0. INSTAGRAM BROWSER DETECTION ───────────────────── */
(function detectInstagramBrowser() {
  var ua = navigator.userAgent || '';

  var isInstagram = /Instagram/i.test(ua);
  var isFacebook  = /FBAN|FBAV/i.test(ua);

  if (!isInstagram && !isFacebook) return;

  var overlay = document.getElementById('ig-overlay');
  var btn     = document.getElementById('ig-overlay-btn');
  var dismiss = document.getElementById('ig-overlay-dismiss');

  if (!overlay || !btn || !dismiss) return;

  var pageUrl = window.location.href;

  var intentUrl = 'intent://' +
    pageUrl.replace(/^https?:\/\//, '') +
    '#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.chrome;end';
  btn.href = intentUrl;

  overlay.style.display = 'flex';

  dismiss.addEventListener('click', function () {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
  });
})();

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
  onScroll();
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

  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });
})();


/* ── 3. STATS COUNTER ANIMATION ────────────────────────────────── */
(function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let hasAnimated = false;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(el => animateCounter(el));
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-strip');
  if (statsSection) {
    observer.observe(statsSection);
  }
})();


/* ── 4. COUNTDOWN TIMER ────────────────────────────────── */
(function initCountdown() {
  const TARGET_DATE = new Date('July 1, 2026 09:00:00').getTime();

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function updateCountdown() {
    const now  = Date.now();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      daysEl.textContent    = '00';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      clearInterval(timerInterval);

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

  let timerInterval;
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
})();


/* ── 5. MODAL LOGIC ────────────────────────────────────── */
(function initModals() {

  function openModal(target) {
    const modal = typeof target === 'string'
      ? document.getElementById(target)
      : target;

    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(target) {
    const modal = typeof target === 'string'
      ? document.getElementById(target)
      : target;

    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
  }

  document.querySelectorAll('.committee-card[data-modal], .community-card[data-modal]').forEach(card => {
    const modalId = card.dataset.modal;

    card.addEventListener('click', () => openModal(modalId));

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(modalId);
      }
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
})();


/* ── 6. STAR FIELD ANIMATION ───────────────────────────── */
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

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { canvas.style.display = 'none'; return; }

  resize();
  animId = requestAnimationFrame(draw);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
})();


/* ── 7. SMOOTH REVEAL ON SCROLL (Intersection Observer) ── */
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
    const delay = (i % 6) * 0.08;
    el.style.transitionDelay = `${delay}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ── 8. ACTIVE NAV LINK HIGHLIGHT (scroll spy) ─────────── */
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


/* ── 9. ONE-TIME VIDEO BACKGROUND WITH FADE ─────────────────────────────── */
(function initOneTimeVideo() {
  const video = document.querySelector('.hero-video');
  const heroContent = document.querySelector('.hero-content');
  const heroSection = document.getElementById('home');
  
  if (!video || !heroContent || !heroSection) {
    return;
  }

  function triggerFade() {
    video.classList.add('fade-out');
    
    setTimeout(() => {
      heroContent.classList.remove('hero-content-hidden');
      heroContent.classList.add('hero-content-visible');
    }, 1250);
    
    setTimeout(() => {
      if (video.parentNode) {
        video.remove();
      }
    }, 2500);
  }

  video.addEventListener('ended', triggerFade, { once: true });
  setTimeout(triggerFade, 3000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        if (video.parentNode) {
          video.remove();
        }
        observer.unobserve(heroSection);
      }
    });
  }, { threshold: 0 });

  observer.observe(heroSection);
})();

/* ── 10. APPLICATION FORM HANDLER ────────────────────────── */
(function initApplicationForm() {
  const form = document.getElementById('application-form');
  const statusDiv = document.getElementById('form-status');
  const applicationTypeSelect = document.getElementById('applicationType');

  const delegateSection = document.getElementById('delegate-section');
  const chairboardSection = document.getElementById('chairboard-section');
  const adminSection = document.getElementById('administrative-section');
  const pressSection = document.getElementById('press-section');

  function hideAllSections() {
    if (delegateSection) delegateSection.style.display = 'none';
    if (chairboardSection) chairboardSection.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';
    if (pressSection) pressSection.style.display = 'none';
  }

  function showRelevantSection(type) {
    hideAllSections();
    
    document.querySelectorAll('#delegate-section [required], #chairboard-section [required], #administrative-section [required], #press-section [required]').forEach(el => {
      el.removeAttribute('required');
    });
    
    switch (type) {
      case 'delegate':
        if (delegateSection) delegateSection.style.display = 'block';
        const delMotivation = document.getElementById('delegateMotivation');
        if (delMotivation) delMotivation.setAttribute('required', 'required');
        break;
      case 'chairboard':
        if (chairboardSection) chairboardSection.style.display = 'block';
        const chairMotivation = document.getElementById('chairboardMotivation');
        const aiQ = document.getElementById('aiQuestion');
        const conflictQ = document.getElementById('conflictQuestion');
        if (chairMotivation) chairMotivation.setAttribute('required', 'required');
        if (aiQ) aiQ.setAttribute('required', 'required');
        if (conflictQ) conflictQ.setAttribute('required', 'required');
        break;
      case 'administrative':
        if (adminSection) adminSection.style.display = 'block';
        const adminMotivation = document.getElementById('adminMotivation');
        if (adminMotivation) adminMotivation.setAttribute('required', 'required');
        break;
      case 'press':
        if (pressSection) pressSection.style.display = 'block';
        const pressMotivation = document.getElementById('pressMotivation');
        if (pressMotivation) pressMotivation.setAttribute('required', 'required');
        break;
    }
  }

  if (applicationTypeSelect) {
    applicationTypeSelect.addEventListener('change', () => {
      showRelevantSection(applicationTypeSelect.value);
    });
  }

  // ── Max 3 Committee Selection Limit ─────────────────────
  function setupCommitteeLimit(groupClass, maxSelect) {
    const checkboxes = document.querySelectorAll('.' + groupClass);
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = document.querySelectorAll('.' + groupClass + ':checked');
        if (checked.length >= maxSelect) {
          checkboxes.forEach(other => {
            if (!other.checked) other.disabled = true;
          });
        } else {
          checkboxes.forEach(other => {
            other.disabled = false;
          });
        }
      });
    });
  }
  setupCommitteeLimit('delegate-committee-cb', 3);
  setupCommitteeLimit('chair-committee-cb', 3);

  // ── FKK Knowledge Question Toggle ───────────────────────
  function setupFkkToggle(checkboxId, panelId) {
    const cb = document.getElementById(checkboxId);
    const panel = document.getElementById(panelId);
    if (!cb || !panel) return;
    cb.addEventListener('change', () => {
      panel.style.display = cb.checked ? 'block' : 'none';
      if (!cb.checked) {
        panel.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
      }
    });
  }
  setupFkkToggle('delegate-fkk-checkbox', 'delegate-fkk-knowledge');
  setupFkkToggle('chair-fkk-checkbox',    'chair-fkk-knowledge');

  // ── Form Submission ──────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    const submitBtn = form.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const formData = new FormData(form);
      const searchParams = new URLSearchParams();

      formData.forEach((value, key) => {
        searchParams.append(key, value);
      });

      searchParams.append('timestamp', new Date().toISOString());
      searchParams.append('applicationId', 'LB' + Date.now());

      console.log('Submitting application data:', Object.fromEntries(searchParams));

      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvOGLVJGmCkJkZZ9_jVjN-qQ-L4IY1RQXc-F6xefCwgasRzA5m0YMb01rtcN9MlcXG7A/exec';

      // GET ile gönder — no-cors POST bazen Google tarafından yutulur
      await fetch(GOOGLE_SCRIPT_URL + '?' + searchParams.toString(), {
        method: 'GET',
        mode: 'no-cors'
      });

      statusDiv.className = 'form-status success';
      statusDiv.textContent = 'Your application has been submitted successfully! Thank you.';
      form.reset();
      hideAllSections();

    } catch (error) {
      console.error('Form submission error:', error);
      statusDiv.className = 'form-status error';

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        statusDiv.textContent = 'Network error! Please check your internet connection and try again.';
      } else {
        statusDiv.textContent = 'An error occurred! Please try again later.';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });
})();
