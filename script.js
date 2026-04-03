/* ===========================
   DevWebPro – script.js
   =========================== */

'use strict';

// ===== CURSOR GLOW =====
(function initCursor() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Smooth follow with lerp
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hide on leave, show on enter
  document.addEventListener('mouseleave', () => glow.style.opacity = '0');
  document.addEventListener('mouseenter', () => glow.style.opacity = '1');
})();

// ===== SCROLL PROGRESS BAR =====
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();

// ===== NAVBAR =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!navbar) return;

  // Overlay for mobile menu
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  // Sticky on scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      overlay.classList.toggle('show', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.addEventListener('click', closeMenu);

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        allNavLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${section.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();

// ===== REVEAL ON SCROLL =====
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ===== HERO CANVAS PARTICLES =====
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animFrameId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['rgba(108,99,255,', 'rgba(196,113,237,', 'rgba(0,210,255,', 'rgba(246,79,89,'];

  // Mouse tracking for particle interaction
  let mouse = { x: -9999, y: -9999 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.opacity = Math.random() * 0.6 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = 1;
      this.decay = Math.random() * 0.003 + 0.001;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.04 + 0.01;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.twinkle += this.twinkleSpeed;
      this.life -= this.decay;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
      }

      if (this.life <= 0 || this.y < -10) this.reset();
    }

    draw() {
      const twinkleOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
      ctx.globalAlpha = twinkleOpacity * this.life;
      ctx.fillStyle = this.color + twinkleOpacity * this.life + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create particles
  const COUNT = 50;
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connection lines (optimized: spatial skip)
  function drawConnections() {
    const maxDist = 100;
    const maxDistSq = maxDist * maxDist;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        if (dx > maxDist || dx < -maxDist) continue;
        const dy = particles[i].y - particles[j].y;
        if (dy > maxDist || dy < -maxDist) continue;
        const distSq = dx * dx + dy * dy;
        if (distSq < maxDistSq) {
          const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.08;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = 'rgba(108,99,255,1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrameId = requestAnimationFrame(animate);
  }
  animate();

  // Pause when not visible (performance)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!animFrameId) animate();
      } else {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });
    obs.observe(heroSection);
  }
})();

// ===== ANIMATED COUNTERS =====
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const runningSet = new WeakSet();

  function animateCounter(el) {
    if (runningSet.has(el)) return;
    runningSet.add(el);

    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function ease(t) {
      // Elastic ease out with bounce
      if (t < 0.7) {
        return 1 - Math.pow(1 - t / 0.7, 3);
      }
      const bounce = (t - 0.7) / 0.3;
      return 1 + Math.sin(bounce * Math.PI * 2) * 0.06 * (1 - bounce);
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(ease(progress) * target);
      el.textContent = current.toLocaleString('pl-PL');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('pl-PL');
        runningSet.delete(el);
      }
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.textContent = '0';
        animateCounter(entry.target);
      } else {
        runningSet.delete(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
})();

// ===== OPINIONS SLIDER =====
(function initSlider() {
  const slider = document.getElementById('opinionsSlider');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slider) return;

  const cards = slider.querySelectorAll('.opinion-card');
  let currentIndex = 0;
  let autoPlayInterval;
  let cardsPerView = getCardsPerView();

  function getCardsPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getTotalSlides() {
    return Math.max(0, cards.length - cardsPerView);
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = getTotalSlides() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function goTo(index) {
    const maxIndex = getTotalSlides();
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    // Get card width including gap
    const cardWidth = cards[0].offsetWidth + 24; // 24px gap
    slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    updateDots();
  }

  function next() {
    const maxIndex = getTotalSlides();
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }

  function prev() {
    const maxIndex = getTotalSlides();
    goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(next, 4500);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoPlay(); });

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  // Touch/swipe support
  let touchStartX = 0;
  let touchDelta = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoPlay();
  }, { passive: true });
  slider.addEventListener('touchmove', (e) => {
    touchDelta = e.touches[0].clientX - touchStartX;
  }, { passive: true });
  slider.addEventListener('touchend', () => {
    if (Math.abs(touchDelta) > 50) {
      touchDelta > 0 ? prev() : next();
    }
    touchDelta = 0;
    startAutoPlay();
  });

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newCpv = getCardsPerView();
      if (newCpv !== cardsPerView) {
        cardsPerView = newCpv;
        currentIndex = 0;
        buildDots();
        goTo(0);
      }
    }, 200);
  });

  buildDots();
  goTo(0);
  startAutoPlay();
})();

// ===== CONTACT FORM =====
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    let valid = true;

    [name, email, message].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(246,79,89,0.5)';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    // Simple email format check
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = 'rgba(246,79,89,0.5)';
      valid = false;
    }

    // RODO consent check
    const rodoConsent = form.querySelector('#rodoConsent');
    if (rodoConsent && !rodoConsent.checked) {
      const checkmark = rodoConsent.nextElementSibling;
      if (checkmark) checkmark.style.borderColor = 'rgba(246,79,89,0.5)';
      valid = false;
    }

    if (!valid) return;

    // Send via FormSubmit.co
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Wysyłanie...';

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        form.reset();
        if (successMsg) {
          successMsg.classList.add('show');
          setTimeout(() => successMsg.classList.remove('show'), 5000);
        }
      } else {
        alert('Wystąpił błąd przy wysyłaniu. Spróbuj ponownie.');
      }
    })
    .catch(() => {
      alert('Błąd połączenia. Sprawdź internet i spróbuj ponownie.');
    })
    .finally(() => {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Wyślij wiadomość';
    });
  });

  // Remove error styling on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });

  // Clear RODO checkbox error on change
  const rodoConsent = form.querySelector('#rodoConsent');
  if (rodoConsent) {
    rodoConsent.addEventListener('change', () => {
      const checkmark = rodoConsent.nextElementSibling;
      if (checkmark) checkmark.style.borderColor = '';
    });
  }
})();

// ===== CARD TILT EFFECT WITH SHINE (event delegation) =====
(function initTilt() {
  const containers = document.querySelectorAll('.offer-grid, .portfolio-grid, .process-timeline');
  if (!containers.length) return;

  // Pre-inject shine elements
  const cards = document.querySelectorAll('.offer-card, .portfolio-item, .process-step');
  cards.forEach(card => {
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    card.appendChild(shine);
  });

  containers.forEach(container => {
    container.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.offer-card, .portfolio-item, .process-step');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`;

      const shine = card.querySelector('.card-shine');
      if (shine) {
        const shineAngle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        shine.style.background = `linear-gradient(${shineAngle}deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)`;
        shine.style.opacity = '1';
      }
    });
    container.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.offer-card, .portfolio-item, .process-step');
      if (card) {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        const shine = card.querySelector('.card-shine');
        if (shine) shine.style.opacity = '0';
        setTimeout(() => card.style.transition = '', 500);
      }
    }, true);
  });
})();

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ===== HERO HEADLINE TYPEWRITER EFFECT =====
(function initTypewriter() {
  const el = document.querySelector('.typewriter-rotate');
  if (!el) return;

  let words;
  try {
    words = JSON.parse(el.dataset.words);
  } catch (e) { return; }
  if (!words || words.length < 2) return;

  // Add cursor
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.after(cursor);

  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 50;
  const pauseEnd = 2000;
  const pauseStart = 500;

  function tick() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = currentWord.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, pauseStart);
        return;
      }
      setTimeout(tick, deleteSpeed);
    } else {
      charIndex++;
      el.textContent = words[wordIndex].substring(0, charIndex);

      if (charIndex === words[wordIndex].length) {
        isDeleting = true;
        setTimeout(tick, pauseEnd);
        return;
      }
      setTimeout(tick, typeSpeed);
    }
  }

  setTimeout(() => {
    isDeleting = true;
    tick();
  }, 3000);
})();

// ===== MAGNETIC BUTTONS =====
(function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .nav-cta-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease';
      setTimeout(() => btn.style.transition = '', 400);
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease, box-shadow 0.3s ease';
    });
  });
})();

// ===== PARALLAX HERO CONTENT & SECTIONS =====
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  const heroBg = document.querySelector('.hero-bg-gradient');
  if (!heroContent) return;

  // Parallax elements in other sections
  const parallaxSections = document.querySelectorAll('.section-header, .cta-wrapper, .about-avatar-wrapper');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Hero parallax
      if (scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
        heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.75);
        if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.1}px)`;
      }

      // Section parallax — subtle upward float effect
      parallaxSections.forEach(el => {
        const rect = el.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;
        if (visible) {
          const center = rect.top + rect.height / 2 - window.innerHeight / 2;
          const offset = center * 0.04;
          el.style.transform = `translateY(${offset}px)`;
        }
      });
      ticking = false;
    });
  }, { passive: true });
})();

// ===== GLOWING CARD MOUSE FOLLOW =====
(function initCardGlow() {
  const cards = document.querySelectorAll('.offer-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(108,99,255,0.12), transparent 60%)`;
      }
    });
  });
})();

// ===== NUMBERS STAGGER IN HERO =====
(function initHeroReveal() {
  const heroElements = document.querySelectorAll('.hero-content .reveal');
  if (!heroElements.length) return;

  let shown = false;
  function showHero() {
    if (shown) return;
    shown = true;
    heroElements.forEach((el, i) => {
      el.style.transitionDelay = `${0.1 + i * 0.12}s`;
      el.classList.add('visible');
    });
  }

  // Show after fonts load to prevent CLS from font swap
  const fallback = setTimeout(showHero, 300);
  document.fonts.ready.then(() => {
    clearTimeout(fallback);
    showHero();
  });
})();

// ===== FAQ ACCORDION =====
(function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

// ===== PRICE CALCULATOR =====
(function initCalculator() {
  function calcTotal() {
    const typeChip = document.querySelector('#calcType .calc-chip.active');
    const timeChip = document.querySelector('#calcTime .calc-chip.active');
    let total = typeChip ? (parseFloat(typeChip.dataset.value) || 0) : 0;
    document.querySelectorAll('#calcFeatures .calc-check-item input:checked').forEach(cb => {
      total += parseFloat(cb.value) || 0;
    });
    const timeMultiplier = timeChip ? (parseFloat(timeChip.dataset.value) || 1) : 1;
    return Math.round(total * timeMultiplier);
  }

  function updateDisplay() {
    const el = document.getElementById('calcAmount');
    if (!el) return;
    el.classList.remove('flip');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('flip');
      });
    });
    el.textContent = calcTotal().toLocaleString('pl-PL');
  }

  document.querySelectorAll('#calcType .calc-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#calcType .calc-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateDisplay();
    });
  });

  document.querySelectorAll('#calcTime .calc-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#calcTime .calc-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateDisplay();
    });
  });

  document.querySelectorAll('#calcFeatures .calc-check-item input').forEach(cb => {
    cb.addEventListener('change', updateDisplay);
  });

  updateDisplay();
})();

// ===== FLOATING CTA =====
(function initFloatingCta() {
  const cta = document.getElementById('floatingCta');
  if (!cta) return;
  const footer = document.querySelector('footer');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > window.innerHeight * 0.6;
    const nearFooter = footer && window.scrollY + window.innerHeight >= footer.offsetTop - 80;
    cta.classList.toggle('visible', scrolled && !nearFooter);
  }, { passive: true });
})();

// ===== EXIT INTENT POPUP =====
(function initExitPopup() {
  const overlay = document.getElementById('exitPopupOverlay');
  const popup = document.getElementById('exitPopup');
  const closeBtn = document.getElementById('exitPopupClose');
  const form = document.getElementById('exitPopupForm');
  if (!overlay || !popup) return;

  if (sessionStorage.getItem('exitPopupShown')) return;

  let triggered = false;

  function showPopup() {
    if (triggered) return;
    triggered = true;
    sessionStorage.setItem('exitPopupShown', '1');
    overlay.classList.add('visible');
  }

  function closePopup() {
    overlay.classList.remove('visible');
  }

  document.addEventListener('mouseleave', e => {
    if (e.clientY < 10) showPopup();
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePopup();
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = popup.querySelector('.exit-popup-success');
      if (msg) msg.style.display = 'block';
      form.style.display = 'none';
      setTimeout(closePopup, 2500);
    });
  }
})();

// ===== PORTFOLIO FILTERS =====
(function initPortfolioFilters() {
  const btns = document.querySelectorAll('.pf-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden-by-filter', !match);
      });
    });
  });
})();

// ===== PORTFOLIO LIGHTBOX =====
(function initPortfolioLightbox() {
  const allItems = Array.from(document.querySelectorAll('.portfolio-item'));
  if (!allItems.length) return;

  // Inject real images / video badges where data attributes are filled
  allItems.forEach(item => {
    const imgSrc = item.dataset.img;
    const videoSrc = item.dataset.video;
    const imgContainer = item.querySelector('.portfolio-img');
    if (!imgContainer) return;

    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = item.querySelector('h3') ? item.querySelector('h3').textContent : 'Portfolio';
      img.className = 'portfolio-real-img';
      imgContainer.innerHTML = '';
      imgContainer.appendChild(img);
      item.classList.add('has-media');
    }

    if (videoSrc) {
      const badge = document.createElement('div');
      badge.className = 'portfolio-video-badge';
      badge.textContent = '▶';
      item.appendChild(badge);
      if (!item.classList.contains('has-media')) item.classList.add('has-media');
    }
  });

  // Only items that have media participate in the lightbox
  let mediaItems = allItems.filter(item => item.dataset.img || item.dataset.video);
  if (!mediaItems.length) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let currentIndex = 0;

  function buildCaption(item) {
    const title = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
    const desc = item.querySelector('.portfolio-info p') ? item.querySelector('.portfolio-info p').textContent : '';
    const tagEl = item.querySelector('.portfolio-tag');
    const tag = tagEl ? tagEl.textContent : '';
    let html = '<strong>' + title + '</strong>';
    if (tag) html += ' &nbsp;<span style="display:inline-block;padding:2px 10px;background:var(--gradient);border-radius:50px;font-size:0.72rem;font-weight:700;color:#fff;vertical-align:middle">' + tag + '</span>';
    if (desc) html += '<br>' + desc;
    return html;
  }

  function openLightbox(index) {
    // Recalculate mediaItems (filter may have changed visibility, but lightbox still navigates all)
    mediaItems = allItems.filter(item => item.dataset.img || item.dataset.video);
    currentIndex = ((index % mediaItems.length) + mediaItems.length) % mediaItems.length;
    const item = mediaItems[currentIndex];
    const imgSrc = item.dataset.img;
    const videoSrc = item.dataset.video;

    lightboxContent.innerHTML = '';
    if (videoSrc) {
      const iframe = document.createElement('iframe');
      const sep = videoSrc.includes('?') ? '&' : '?';
      iframe.src = videoSrc + sep + 'autoplay=1';
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      lightboxContent.appendChild(iframe);
    } else if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = item.querySelector('h3') ? item.querySelector('h3').textContent : '';
      lightboxContent.appendChild(img);
    }

    lightboxCaption.innerHTML = buildCaption(item);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    const hasMultiple = mediaItems.length > 1;
    lightboxPrev.style.display = hasMultiple ? '' : 'none';
    lightboxNext.style.display = hasMultiple ? '' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  // Bind clicks on items with media
  allItems.forEach((item) => {
    if (!item.dataset.img && !item.dataset.video) return;
    item.addEventListener('click', () => {
      const idx = mediaItems.indexOf(item);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  lightboxPrev.addEventListener('click', () => openLightbox(currentIndex - 1));
  lightboxNext.addEventListener('click', () => openLightbox(currentIndex + 1));
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });
})();

// ===== DARK / LIGHT MODE TOGGLE =====
(function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

// ===== COOKIE CONSENT MODAL =====
(function initCookieConsent() {
  const overlay = document.getElementById('cookieOverlay');
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  const rejectBtn = document.getElementById('cookieReject');
  const settingsBtn = document.getElementById('cookieSettings');
  const settingsPanel = document.getElementById('cookieSettingsPanel');
  const saveSettingsBtn = document.getElementById('cookieSaveSettings');
  const analyticsCheck = document.getElementById('cookieAnalytics');
  const marketingCheck = document.getElementById('cookieMarketing');
  if (!overlay || !banner) return;

  function getCookieConsent() {
    try {
      const data = localStorage.getItem('cookieConsent');
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }

  function saveCookieConsent(consent) {
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    hideModal();
    applyConsent(consent);
  }

  function applyConsent(consent) {
    if (consent.analytics) {
      // Enable Google Analytics etc.
    }
    if (consent.marketing) {
      // Enable marketing pixels etc.
    }
  }

  function showModal() {
    setTimeout(() => {
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }, 2500);
  }

  function hideModal() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // Check if consent already given
  const existing = getCookieConsent();
  if (existing) {
    applyConsent(existing);
  } else {
    showModal();
  }

  acceptBtn.addEventListener('click', () => {
    saveCookieConsent({ necessary: true, analytics: true, marketing: true });
  });

  rejectBtn.addEventListener('click', () => {
    saveCookieConsent({ necessary: true, analytics: false, marketing: false });
  });

  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
  });

  saveSettingsBtn.addEventListener('click', () => {
    saveCookieConsent({
      necessary: true,
      analytics: analyticsCheck.checked,
      marketing: marketingCheck.checked,
    });
  });
})();
