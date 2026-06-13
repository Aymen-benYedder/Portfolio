import { useState, useEffect } from 'react';

export default function NavbarIsland() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const headerClass = `navbar flex items-center justify-between px-[var(--section-px)] h-[52px] border-b border-[rgba(16,185,129,0.15)] fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[rgba(5,5,5,0.95)] backdrop-blur-[20px]' : 'bg-[rgba(5,5,5,0.9)]'}`;

  return (
    <header className={headerClass}>
      <nav className="flex items-center justify-between w-full" role="navigation" aria-label="Main navigation">
        <a href="/" className="nav-logo font-[family-name:var(--font-mono)] text-[var(--text-xs)] font-bold tracking-[0.1em] text-[var(--accent)] no-underline min-h-[44px] flex items-center drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-flicker">
          AYMEN.DEV
        </a>

        <ul
          className="nav-links hidden md:flex md:flex-row gap-0 list-none m-0 p-0"
          style={menuOpen ? { display: 'flex', flexDirection: 'column', position: 'absolute', top: '52px', left: 0, right: 0, background: 'rgba(5,5,5,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(16,185,129,0.15)', padding: 'var(--spacing-gap-md) var(--section-px)' } : undefined}
        >
          <li><a href="/" className="font-[family-name:var(--font-mono)] text-[var(--text-2xs)] tracking-[0.1em] text-[var(--text-2)] px-[14px] h-[52px] max-md:h-[44px] flex items-center no-underline uppercase hover:text-[var(--accent)] hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)] transition-all duration-200 hover-lift">Home</a></li>
          <li><a href="/blog/" className="font-[family-name:var(--font-mono)] text-[var(--text-2xs)] tracking-[0.1em] text-[var(--text-2)] px-[14px] h-[52px] max-md:h-[44px] flex items-center no-underline uppercase hover:text-[var(--accent)] hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)] transition-all duration-200 hover-lift">Blog</a></li>
          <li><a href="/services/" className="font-[family-name:var(--font-mono)] text-[var(--text-2xs)] tracking-[0.1em] text-[var(--text-2)] px-[14px] h-[52px] max-md:h-[44px] flex items-center no-underline uppercase hover:text-[var(--accent)] hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)] transition-all duration-200 hover-lift">Services</a></li>
        </ul>

        <button
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--accent)] transition-colors duration-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </nav>
    </header>
  );
}
