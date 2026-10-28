/**
 * DigitalSnove — Official JavaScript Engine
 * Brand: DigitalSnove | Tagline: Think Digital. Go Global.
 * Written in clean, vanilla JavaScript for 100% compatibility with Hostinger / cPanel
 * Easy to read and edit section-by-section.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // =========================================================================
  // 0. Clean URLs in Browser Address Bar (Hide .html)
  // =========================================================================
  if (window.location.protocol.startsWith('http') && window.location.pathname.endsWith('.html')) {
    try {
      const cleanPath = window.location.pathname.replace(/\.html$/, '');
      window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    } catch(e) {}
  }

  // =========================================================================
  // 1. Header Scroll Blur & Sticky Effect
  // =========================================================================
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // =========================================================================
  // 2. Mobile Navigation Drawer & Overlay
  // =========================================================================
  const mobileToggle = document.querySelector('.mobile-toggle');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileOverlay = document.querySelector('.mobile-overlay');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileDrawer);
  }
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileDrawer);
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileDrawer();
  });

  // =========================================================================
  // 3. Services Slider / Carousel (Homepage)
  // =========================================================================
  const servicesTrack = document.getElementById('services-slider-track');
  const prevServiceBtn = document.getElementById('services-prev-btn');
  const nextServiceBtn = document.getElementById('services-next-btn');

  if (servicesTrack && prevServiceBtn && nextServiceBtn) {
    const scrollAmount = 380;

    nextServiceBtn.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevServiceBtn.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 4. Testimonials Slider
  // =========================================================================
  const testimonialCards = document.querySelectorAll('.testimonial-slide-item');
  const testPrevBtn = document.getElementById('test-prev-btn');
  const testNextBtn = document.getElementById('test-next-btn');
  const testDots = document.querySelectorAll('.slider-dots .dot');

  if (testimonialCards.length > 0) {
    let currentTestimonial = 0;

    function showTestimonial(index) {
      testimonialCards.forEach((card, i) => {
        card.style.display = i === index ? 'flex' : 'none';
      });
      testDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentTestimonial = index;
    }

    if (testNextBtn) {
      testNextBtn.addEventListener('click', function () {
        let nextIndex = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(nextIndex);
      });
    }

    if (testPrevBtn) {
      testPrevBtn.addEventListener('click', function () {
        let prevIndex = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        showTestimonial(prevIndex);
      });
    }

    testDots.forEach((dot, i) => {
      dot.addEventListener('click', function () {
        showTestimonial(i);
      });
    });

    // Auto-advance testimonials every 7 seconds
    let testimonialTimer = setInterval(() => {
      let nextIndex = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(nextIndex);
    }, 7000);

    const testContainer = document.querySelector('.testimonials-slider-wrap');
    if (testContainer) {
      testContainer.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
      testContainer.addEventListener('mouseleave', () => {
        clearInterval(testimonialTimer);
        testimonialTimer = setInterval(() => {
          let nextIndex = (currentTestimonial + 1) % testimonialCards.length;
          showTestimonial(nextIndex);
        }, 7000);
      });
    }

    showTestimonial(0);
  }

  // =========================================================================
  // 5. FAQ Accordion
  // =========================================================================
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const parentItem = this.closest('.accordion-item');
      const isOpen = parentItem.classList.contains('open');

      // Optional: Close other open accordion items
      document.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        if (openItem !== parentItem) {
          openItem.classList.remove('open');
        }
      });

      // Toggle current
      if (isOpen) {
        parentItem.classList.remove('open');
      } else {
        parentItem.classList.add('open');
      }
    });
  });

  // =========================================================================
  // 6. Animated Statistics Numbers on Scroll
  // =========================================================================
  const statNumbers = document.querySelectorAll('.stat-count');
  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1800; // ms
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(current) + suffix;
              }
            }, stepTime);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  }

  // =========================================================================
  // 7. Portfolio Category Filters
  // =========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-item-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      filterBtns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      const filterValue = this.getAttribute('data-filter');

      portfolioCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // =========================================================================
  // 8. Contact Form Handler (Hostinger / cPanel Ready)
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const alertBox = document.getElementById('form-alert-success');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending message...';
      }

      // Simulate sending / Ready for PHP mailer backend
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message';
        }
        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '&#10003; Thank you! Your message has been sent successfully. We will contact you within 24 hours.';
        }
        contactForm.reset();
      }, 1000);
    });
  }

  // =========================================================================
  // 9. Get a Quote Form Handler
  // =========================================================================
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const alertBox = document.getElementById('quote-alert-success');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Preparing your quote request...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit Quote Request';
        }
        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '&#10003; Quote inquiry received! Our senior strategy team will review your requirements and provide a customized proposal shortly.';
        }
        quoteForm.reset();
      }, 1000);
    });
  }

  // =========================================================================
  // 10. Smooth Scrolling for Anchor Links
  // =========================================================================
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileDrawer();
      }
    });
  });

});
