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
  function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length === 0) return;

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

    window.addEventListener('scroll', updateActiveLink);
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

    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    });

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

    window.addEventListener('scroll', function() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / docHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  /**
   * Table of Contents
   * Auto-generates TOC from h2 headings in article
   * Highlights current section as user scrolls
   */
  function initTableOfContents() {
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

    // Highlight current section
    window.addEventListener('scroll', function() {
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

      block.appendChild(copyButton);

      copyButton.addEventListener('click', function(e) {
        e.preventDefault();
        const code = block.querySelector('code')?.textContent || block.textContent;
        navigator.clipboard.writeText(code).then(function() {
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('copied');
          setTimeout(function() {
            copyButton.textContent = 'Copy';
            copyButton.classList.remove('copied');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy:', err);
          copyButton.textContent = 'Error';
          setTimeout(function() {
            copyButton.textContent = 'Copy';
          }, 1500);
        });
      });
    });
  }

  /**
   * Initialize all features on page load
   * Runs when DOM is fully parsed
   */
  function initAll() {
    updateFooterYear();
    initSmoothScroll();
    initMobileNav();
    initScrollAnimations();
    initActiveNav();
    initScrollToTop();
    initFAQAccordion();
    initReadingProgressBar();
    initTableOfContents();
    initCopyCodeButton();
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    // DOM is already loaded
    initAll();
  }
})();
