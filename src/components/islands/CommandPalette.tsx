import { useState, useEffect, useRef } from 'react';

interface Command {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

const commands: Command[] = [
  { id: 'home', label: 'Home', href: '/', icon: '⌂' },
  { id: 'blog', label: 'Blog', href: '/blog/', icon: '✎' },
  { id: 'services', label: 'Services', href: '/services/', icon: '⚙' },
  { id: 'contact', label: 'Contact', href: '/#contact', icon: '✉' },
  { id: 'resume', label: 'Download Resume', href: '/assets/resume.pdf', icon: '↓' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  const showCommands = query.length === 0 || filtered.length > 0;

  const navigate = (href: string) => {
    setOpen(false);
    window.location.href = href;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) { navigate(filtered[selectedIndex].href); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-[8px] flex items-start justify-center pt-[15vh] z-[9999]" onClick={() => setOpen(false)}>
      <div className="w-[560px] max-md:w-[90vw] glass-panel shadow-[0_32px_64px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className="flex items-center gap-[10px] px-[var(--card-px)] py-[14px] border-b border-[rgba(16,185,129,0.1)]">
          <span className="text-[var(--text-3)] text-[14px]">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="flex-1 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text-1)] bg-transparent border-none outline-none placeholder:text-[var(--text-3)]"
          />
          <button onClick={() => setOpen(false)} className="text-[var(--text-3)] text-[11px] border border-[var(--border)] px-[6px] py-[2px] bg-transparent cursor-pointer hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200">ESC</button>
        </div>

        {showCommands && (
          <div className="py-[4px]">
            {filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => navigate(cmd.href)}
                className={`flex items-center gap-[12px] px-[var(--card-px)] py-[10px] font-[family-name:var(--font-mono)] text-[12px] cursor-pointer border-l-2 ${i === selectedIndex ? 'bg-[rgba(16,185,129,0.08)] text-[var(--accent)] border-l-[var(--accent)]' : 'border-l-transparent text-[var(--text-2)]'}`}
              >
                <span className="text-[var(--text-3)] w-[18px] text-[13px]">{cmd.icon}</span>
                <span>{cmd.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
