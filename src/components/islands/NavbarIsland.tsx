import { useState, useEffect, useRef, useCallback } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Exp.', href: '/#experience' },
  { label: 'Proj.', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/#contact' },
] as const;

const SECTION_IDS = ['experience', 'projects', 'skills', 'contact'];

export default function NavbarIsland() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const menuRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Scroll listener: track scroll position, shrink state, progress
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShrunk(y > 100);
      // Scroll progress (document height - viewport height)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(y / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Theme initialization: read localStorage + system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (stored === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const theme = next ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      return next;
    });
  }, []);

  // Section tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Escape key closes menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Outside click closes menu (touch + mouse)
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    document.addEventListener('touchstart', onClickOutside, { passive: true });
    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('touchstart', onClickOutside);
    };
  }, [menuOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const getNavHref = (item: typeof NAV_ITEMS[number]) => {
    if (item.href.startsWith('/#')) {
      // For section links, always navigate to root with hash
      return item.href;
    }
    return item.href;
  };

  const isActive = (item: typeof NAV_ITEMS[number]) => {
    if (item.href.startsWith('/#')) {
      const sectionId = item.href.replace('/#', '');
      return activeSection === sectionId;
    }
    // Blog link active when on /blog/ page
    if (typeof document !== 'undefined') {
      return item.href !== '/' && window.location.pathname.startsWith(item.href.replace(/\/$/, ''));
    }
    return false;
  };

  const headerHeight = shrunk ? 'h-[44px]' : 'h-[52px]';
  const logoScale = shrunk ? 'scale-[0.92]' : 'scale-100';

  return (
    <header
      ref={headerRef}
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${headerHeight} ${scrolled ? 'bg-[var(--surface)]/90 backdrop-blur-[24px] shadow-[0_1px_0_var(--accent-glass)]' : 'bg-[var(--surface)]/80'}`}
    >
      <nav className="flex items-center justify-between w-full h-full px-[var(--section-px)]" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <a
          href="/"
          className={`nav-logo font-[family-name:var(--font-mono)] text-[var(--text-xs)] font-bold tracking-[0.1em] text-[var(--accent)] no-underline min-h-[44px] flex items-center drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-300 ${logoScale} origin-left`}
        >
          AYMEN.DEV
        </a>

        {/* Desktop nav links */}
        <ul className="nav-links hidden md:flex md:flex-row items-center gap-0 list-none m-0 p-0 h-full">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="h-full flex items-center">
              <a
                href={getNavHref(item)}
                onClick={closeMenu}
                data-magnetic
                className={`font-[family-name:var(--font-mono)] text-[var(--text-2xs)] tracking-[0.1em] px-[14px] h-full flex items-center no-underline uppercase transition-all duration-200 relative
                  ${isActive(item)
                    ? 'text-[var(--accent)] drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]'
                    : 'text-[var(--text-2)] hover:text-[var(--accent)] hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]'
                  }`}
              >
                {item.label}
                {/* Active indicator line */}
                {isActive(item) && (
                  <span className="absolute bottom-[2px] left-[14px] right-[14px] h-[2px] bg-[var(--accent)] rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Theme toggle — visible on all breakpoints */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          {isDark ? (
            /* Sun icon for dark → light */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ pointerEvents: 'none' }}>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            /* Moon icon for light → dark */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ pointerEvents: 'none' }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Mobile burger */}
        <button
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--accent)] transition-colors duration-200"
          onClick={() => setMenuOpen((prev) => !prev)}
          onTouchEnd={(e) => { e.preventDefault(); setMenuOpen((prev) => !prev); }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ pointerEvents: 'none' }}>
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <ul
          ref={menuRef}
          className="md:hidden list-none m-0 p-0"
          style={{
            background: 'var(--surface)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--spacing-gap-md) var(--section-px)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={getNavHref(item)}
                onClick={closeMenu}
                className={`font-[family-name:var(--font-mono)] text-[var(--text-2xs)] tracking-[0.1em] h-[44px] flex items-center no-underline uppercase transition-all duration-200
                  ${isActive(item)
                    ? 'text-[var(--accent)] drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]'
                    : 'text-[var(--text-2)] hover:text-[var(--accent)]'
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Scroll progress bar at bottom of navbar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[rgba(16,185,129,0.06)]">
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-150 ease-out shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </header>
  );
}
