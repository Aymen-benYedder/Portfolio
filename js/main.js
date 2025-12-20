/**
 * Main.js - Centralized UI Interactivity
 * Consolidates all client-side interactions: smooth scrolling, navigation, animations
 * Uses IIFE pattern for encapsulation and DOMContentLoaded lifecycle management
 */

(function() {
  'use strict';

  /**
   * Smooth Scrolling for Anchor Links
   * Prevents default behavior and smoothly scrolls to target elements
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
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
    const navMenu = document.querySelector('.nav-menu');

    if (!navToggle || !navMenu) return;

    // Toggle menu on button click
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      }
    });

    // Close menu on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav') && navMenu.classList.contains('active')) {
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
    return function(...args) {
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

        const observer = new IntersectionObserver(function(entries) {
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
      window.requestAnimationFrame(function() {
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

    scrollButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
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
        question.addEventListener('click', function(e) {
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
      window.requestAnimationFrame(function() {
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
        window.requestAnimationFrame(function() {
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

      copyButton.addEventListener('click', function(e) {
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
          navigator.clipboard.writeText(code).then(function() {
            copyButton.textContent = 'Copied!';
            copyButton.classList.add('copied');
            announce('Code copied to clipboard');
            setTimeout(function() {
              copyButton.textContent = 'Copy';
              copyButton.classList.remove('copied');
            }, 2000);
          }).catch(function(err) {
            console.error('Failed to copy with Clipboard API:', err);
            copyButton.textContent = 'Error';
            announce('Copy failed');
            setTimeout(function() { copyButton.textContent = 'Copy'; }, 1500);
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
            setTimeout(function() { copyButton.textContent = 'Copy'; copyButton.classList.remove('copied'); }, 2000);
          } else {
            copyButton.textContent = 'Error';
            announce('Copy not supported');
            setTimeout(function() { copyButton.textContent = 'Copy'; }, 1500);
          }
        } catch (err) {
          console.error('Copy fallback failed:', err);
          copyButton.textContent = 'Not supported';
          announce('Copy not supported');
          setTimeout(function() { copyButton.textContent = 'Copy'; }, 1500);
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
      btn.addEventListener('click', function() {
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
      initFAQAccordion();
      initReadingProgressBar();
      initTableOfContents();
      initCopyCodeButton();
      initBlogFilter();
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
