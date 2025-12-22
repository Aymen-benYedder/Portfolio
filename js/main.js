/**
 * Main.js - Centralized UI Interactivity
 * Consolidates all client-side interactions: smooth scrolling, navigation, animations
 * Uses IIFE pattern for encapsulation and DOMContentLoaded lifecycle management
 */

(function () {
  'use strict';

  /**
   * Detect if device is mobile/touch-capable
   * Used to conditionally initialize mouse-dependent effects
   */
  function isMobileDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  /**
   * Smooth Scrolling for Anchor Links
   * Prevents default behavior and smoothly scrolls to target elements
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Skip if href is just '#'
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Mobile Navigation Toggle
   * Manages menu visibility and ARIA attributes
   * Closes menu on link click, outside click, or ESC key
   */
  function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.mobile-menu-dropdown');

    if (!navToggle || !navMenu) return;

    // Toggle menu on button click
    navToggle.addEventListener('click', function () {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      }
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-container') && navMenu.classList.contains('active')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      }
    });
  }

  /**
   * Scroll-Based Animations
   * Uses Intersection Observer API to trigger fade-in animations
   * Targets elements with .animate-on-scroll class
   */
  // Utility: Debounce helper
  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        timeout = null;
        fn.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    if (animateElements.length === 0) return;

    // Feature detection for IntersectionObserver
    if ('IntersectionObserver' in window) {
      try {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        }, observerOptions);

        animateElements.forEach(element => {
          observer.observe(element);
        });
      } catch (err) {
        console.error('Animation observer failed:', err);
        animateElements.forEach(el => el.classList.add('animated'));
      }
    } else {
      // Fallback: simply mark elements as animated
      animateElements.forEach(el => el.classList.add('animated'));
    }
  }

  /**
   * Contact Form Submission Handler
   * Sends form data via fetch/AJAX with fallback to email client
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      // Validate form
      if (!data.name || !data.email || !data.subject || !data.message) {
        alert('Please fill in all fields.');
        return;
      }

      // Disable submit button during request
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        // Send email via backend endpoint
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          // Success feedback
          submitBtn.textContent = '✓ Message Sent!';
          form.reset();
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Failed to send email');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        // Fallback: open email client
        alert('Could not send message via server. Opening email client...');
        window.location.href = `mailto:aymen@yourportfolio.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.message + '\n\nFrom: ' + data.name + ' (' + data.email + ')')}`;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /**
   * Active Navigation Highlighting
   * Updates nav links based on scroll position and current section
   */
  function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (navLinks.length === 0) return;

    function updateActiveLink() {
      let current = '';

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;

        const section = document.querySelector(href);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            current = href;
          }
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === current) {
          link.classList.add('active');
        }
      });
    }

    // Debounced / RAF-wrapped handler for smooth performance
    const handler = debounce(() => { window.requestAnimationFrame(updateActiveLink); }, 50);

    try {
      window.addEventListener('scroll', handler, { passive: true });
    } catch (e) {
      // Older browsers may not accept options
      window.addEventListener('scroll', handler);
    }

    updateActiveLink();
  }

  /**
   * Scroll-to-Top Button
   * Shows button when user scrolls down 300px
   * Smooth scrolls to top on click
   */
  function initScrollToTop() {
    const scrollButton = document.getElementById('scroll-to-top');

    if (!scrollButton) return;

    const handler = debounce(() => {
      window.requestAnimationFrame(function () {
        if (window.scrollY > 300) {
          scrollButton.classList.add('visible');
        } else {
          scrollButton.classList.remove('visible');
        }
      });
    }, 50);

    try {
      window.addEventListener('scroll', handler, { passive: true });
    } catch (e) {
      window.addEventListener('scroll', handler);
    }

    scrollButton.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Navigation Scroll Effect
   * Changes nav styling when user scrolls down
   */
  function initNavScrollEffect() {
    const navContainer = document.querySelector('.nav-container');
    
    if (!navContainer) return;

    const handler = debounce(() => {
      window.requestAnimationFrame(function () {
        if (window.scrollY > 100) {
          navContainer.classList.add('scrolled');
        } else {
          navContainer.classList.remove('scrolled');
        }
      });
    }, 50);

    try {
      window.addEventListener('scroll', handler, { passive: true });
    } catch (e) {
      window.addEventListener('scroll', handler);
    }
  }

  /**
   * FAQ Accordion
   * Toggles .active class on FAQ items
   * Updates ARIA attributes for accessibility
   */
  function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    if (faqQuestions.length === 0) return;

    faqQuestions.forEach(question => {
      const faqItem = question.closest('.faq-item');
      const toggle = question.querySelector('.faq-toggle');

      if (faqItem && toggle) {
        // Initialize aria-expanded state
        const isActive = faqItem.classList.contains('active');
        toggle.setAttribute('aria-expanded', isActive);

        // Add click handler to question element
        question.addEventListener('click', function (e) {
          // Prevent event bubbling
          e.stopPropagation();

          // Toggle the active state
          faqItem.classList.toggle('active');
          const newState = faqItem.classList.contains('active');
          toggle.setAttribute('aria-expanded', newState);
        });
      }
    });
  }

  /**
   * Reading Progress Bar
   * Shows scroll progress as a top bar
   */
  function initReadingProgressBar() {
    const progressBar = document.getElementById('reading-progress');

    if (!progressBar) return;

    const handler = debounce(() => {
      window.requestAnimationFrame(function () {
        try {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
          progressBar.style.width = scrolled + '%';
        } catch (err) {
          console.error('Reading progress update failed:', err);
        }
      });
    }, 50);

    try {
      window.addEventListener('scroll', handler, { passive: true });
    } catch (e) {
      window.addEventListener('scroll', handler);
    }
  }

  /**
   * Table of Contents
   * Auto-generates TOC from h2 headings in article
   * Highlights current section as user scrolls
   */
  function initTableOfContents() {
    try {
      const tocContainer = document.getElementById('table-of-contents');
      const article = document.querySelector('article');

      if (!tocContainer || !article) return;

      const headings = Array.from(article.querySelectorAll('h2'));

      if (headings.length === 0) return;

      // Generate TOC
      const tocList = document.createElement('ul');
      headings.forEach((heading, index) => {
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.classList.add('toc-link');
        li.appendChild(a);
        tocList.appendChild(li);
      });

      tocContainer.appendChild(tocList);

      // Highlight current section (debounced + RAF)
      const handler = debounce(() => {
        window.requestAnimationFrame(function () {
          let current = '';
          headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 150) {
              current = heading.id;
            }
          });

          document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
              link.classList.add('active');
            }
          });
        });
      }, 50);

      try {
        window.addEventListener('scroll', handler, { passive: true });
      } catch (e) {
        window.addEventListener('scroll', handler);
      }
    } catch (err) {
      console.error('TOC generation failed:', err);
    }
  }

  /**
   * Update Footer Year
   * Sets current year in footer
   */
  function updateFooterYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  /**
   * Copy Code Button
   * Adds copy-to-clipboard functionality to code blocks
   */
  function initCopyCodeButton() {
    document.querySelectorAll('.code-block').forEach(block => {
      // Only add button if not already present
      if (block.querySelector('.code-block-copy')) return;

      const copyButton = document.createElement('button');
      copyButton.className = 'code-block-copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      copyButton.setAttribute('type', 'button');
      copyButton.textContent = 'Copy';

      // If Clipboard API is not available, show a disabled fallback with hint
      if (!navigator.clipboard) {
        copyButton.setAttribute('disabled', 'true');
        copyButton.title = 'Copy not supported in this browser';
      }

      block.appendChild(copyButton);

      copyButton.addEventListener('click', function (e) {
        e.preventDefault();
        const code = block.querySelector('code')?.textContent || block.textContent;

        // Ensure a polite live region exists for status announcements
        let uiStatus = document.getElementById('ui-status');
        if (!uiStatus) {
          uiStatus = document.createElement('div');
          uiStatus.id = 'ui-status';
          uiStatus.setAttribute('aria-live', 'polite');
          uiStatus.style.position = 'absolute';
          uiStatus.style.left = '-9999px';
          uiStatus.style.width = '1px';
          uiStatus.style.height = '1px';
          uiStatus.style.overflow = 'hidden';
          document.body.appendChild(uiStatus);
        }

        function announce(text) {
          uiStatus.textContent = '';
          setTimeout(() => { uiStatus.textContent = text; }, 50);
        }

        // Prefer modern Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            copyButton.textContent = 'Copied!';
            copyButton.classList.add('copied');
            announce('Code copied to clipboard');
            setTimeout(function () {
              copyButton.textContent = 'Copy';
              copyButton.classList.remove('copied');
            }, 2000);
          }).catch(function (err) {
            console.error('Failed to copy with Clipboard API:', err);
            copyButton.textContent = 'Error';
            announce('Copy failed');
            setTimeout(function () { copyButton.textContent = 'Copy'; }, 1500);
          });
          return;
        }

        // Fallback: try execCommand where supported
        try {
          const textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);

          if (successful) {
            copyButton.textContent = 'Copied!';
            copyButton.classList.add('copied');
            announce('Code copied to clipboard');
            setTimeout(function () { copyButton.textContent = 'Copy'; copyButton.classList.remove('copied'); }, 2000);
          } else {
            copyButton.textContent = 'Error';
            announce('Copy not supported');
            setTimeout(function () { copyButton.textContent = 'Copy'; }, 1500);
          }
        } catch (err) {
          console.error('Copy fallback failed:', err);
          copyButton.textContent = 'Not supported';
          announce('Copy not supported');
          setTimeout(function () { copyButton.textContent = 'Copy'; }, 1500);
        }
      });
    });
  }

  /**
   * Blog Filtering
   * Filters articles on the Blog index page by data-category
   */
  function initBlogFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const grid = document.getElementById('blog-grid');
    if (!buttons.length || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    const emptyState = document.getElementById('blog-empty-state');

    function applyFilter(filter) {
      let visible = 0;
      cards.forEach(card => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyState) {
        emptyState.style.display = visible === 0 ? '' : 'none';
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        applyFilter(btn.dataset.filter);
      });
    });

    // Initialize state from active button
    const initial = document.querySelector('.filter-btn.active');
    applyFilter(initial ? initial.dataset.filter : 'all');
  }

  /**
  /* Theme Toggle (Light/Dark) - Desktop & Mobile Synchronized */
  function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('#theme-toggle, .mobile-theme-toggle');
    const html = document.documentElement;

    if (toggleBtns.length === 0) return;

    // 1. Initialize State (apply once)
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = savedTheme || 'dark';

    html.setAttribute('data-theme', defaultTheme);

    // 2. Toggle Handler - attach to all buttons
    const toggleHandler = () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    };

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', toggleHandler);
    });
  }

  /**
   * 3D Tilt Effect for Cards
   * Applies a subtle parallax rotation based on mouse position
   */
  function initTiltEffect() {
    const cards = document.querySelectorAll('.glass-card, .glass-card-dark, .work-card, .project-card, .executive-summary-card, .blog-card, .testimonial-card, .language-card, .capabilities-card, .related-article-card, .education-item');

    if (cards.length === 0) return;

    cards.forEach(card => {
      card.classList.add('tilt-card');
      // Wrap content if not already wrapped (to separate frame from content transform if needed, 
      // but for simple tilt we can transform the card itself or a direct child)
      // For this implementation, we'll tilt the card itself but reset on leave.

      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (max 5 degrees)
        const xPct = (x / rect.width) - 0.5;
        const yPct = (y / rect.height) - 0.5;

        // Reverse signs for "looking at" effect
        const rotateX = yPct * -10;
        const rotateY = xPct * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  /**
   * Interactive Spotlight for Glass Cards
   * Tracks mouse position to create a dynamic gradient light effect
   */
  function initSpotlightEffect() {
    const cards = document.querySelectorAll('.glass-card, .glass-card-dark, .work-card, .project-card, .testimonial-card, .capabilities-card, .blog-card, .language-card, .executive-summary-card, .related-article-card, .education-item');

    if (cards.length === 0) return;

    // Use a singlemousemove listener on body for performance, or per-card if specific container needed.
    // Here we'll attach to cards for localized coordinates.
    cards.forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /**
   * Magnetic Typography Effect
   * Physically attracts text elements to the mouse cursor
   */
  function initMagneticEffect() {
    const magnets = document.querySelectorAll('.magnetic-text');

    if (magnets.length === 0) return;

    magnets.forEach(magnet => {
      magnet.addEventListener('mousemove', function (e) {
        const rect = magnet.getBoundingClientRect();
        // Calculate center of the element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Strength of the pull (0.5 means move half the distance to cursor)
        const strength = 0.5;

        // Move the element
        magnet.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
        magnet.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)'; // Snappy movement
      });

      magnet.addEventListener('mouseleave', function () {
        // Snap back to original position
        magnet.style.transform = 'translate(0, 0)';
        magnet.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'; // Smooth release
      });
    });
  }

  /**
   * Initialize all features on page load
   * Runs when DOM is fully parsed
   */
  function initAll() {
    try {
      updateFooterYear();
      initSmoothScroll();
      initMobileNav();
      initScrollAnimations();
      initActiveNav();
      initContactForm();
      initScrollToTop();
      initNavScrollEffect();
      initFAQAccordion();
      initReadingProgressBar();
      initTableOfContents();
      initCopyCodeButton();
      initBlogFilter();
      initThemeToggle();

      // Desktop-only effects (mouse-based interactions)
      if (!isMobileDevice()) {
        initTiltEffect();
        initSpotlightEffect();
        initMagneticEffect();
      }
    } catch (err) {
      console.error('Initialization error in initAll:', err);
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // DOM is already loaded
    initAll();
  }
})();
