/* ===========================
   WebDevPro – script.js
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
      if (this.life <= 0 || this.y < -10) this.reset();
    }

    draw() {
      const twinkleOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.twinkle));
      ctx.save();
      ctx.globalAlpha = twinkleOpacity * this.life;
      ctx.fillStyle = this.color + twinkleOpacity * this.life + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color + '0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  const COUNT = 120;
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connection lines
  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = 'rgba(108,99,255,1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
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
      // Ease out cubic
      return 1 - Math.pow(1 - t, 3);
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

    if (!valid) return;

    // Simulate send (no actual backend)
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Wysyłanie...';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Wyślij wiadomość';
      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    }, 1200);
  });

  // Remove error styling on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
})();

// ===== CARD TILT EFFECT =====
(function initTilt() {
  const cards = document.querySelectorAll('.offer-card, .portfolio-item, .process-step');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease';
    });
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
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  // Just add a subtle cursor effect at end of first span
  const gradientSpan = heroTitle.querySelector('.gradient-text');
  if (!gradientSpan) return;

  const cursor = document.createElement('span');
  cursor.style.cssText = `
    display: inline-block;
    width: 3px;
    height: 0.85em;
    background: linear-gradient(135deg, #6c63ff, #c471ed);
    margin-left: 4px;
    vertical-align: middle;
    border-radius: 2px;
    animation: blink 1s ease-in-out infinite;
  `;
  gradientSpan.after(cursor);

  // Remove cursor after 4 seconds
  setTimeout(() => {
    cursor.style.animation = 'none';
    cursor.style.opacity = '0';
    cursor.style.transition = 'opacity 0.5s';
  }, 4000);
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

// ===== PARALLAX HERO CONTENT =====
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  const heroBg = document.querySelector('.hero-bg-gradient');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) return;
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.75);
    if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.1}px)`;
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
  heroElements.forEach((el, i) => {
    el.style.transitionDelay = `${0.1 + i * 0.12}s`;
    setTimeout(() => el.classList.add('visible'), 100 + i * 120);
  });
})();
