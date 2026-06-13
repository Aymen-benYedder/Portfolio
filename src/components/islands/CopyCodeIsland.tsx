import { useState } from 'react';

export default function CopyCodeIsland({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className="font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-[0.1em] uppercase px-[10px] py-[4px] border border-[var(--border)] text-[var(--text-3)] bg-transparent cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_0_6px_rgba(16,185,129,0.15)] transition-all duration-200"
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
