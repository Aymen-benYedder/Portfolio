import { useEffect } from 'react';

export default function CodeBlockInjector() {
  useEffect(() => {
    const pres = document.querySelectorAll('pre');
    pres.forEach(pre => {
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;
      const code = pre.querySelector('code');
      if (!code) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper relative group';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      const btn = document.createElement('button');
      btn.className = 'copy-btn font-[family-name:var(--font-mono)] text-[9px] font-bold tracking-[0.1em] uppercase px-[10px] py-[4px] border border-[var(--border)] text-[var(--text-3)] bg-[var(--inset)] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_0_6px_rgba(16,185,129,0.15)] transition-all duration-200';
      btn.textContent = 'Copy';
      btn.style.cssText = 'position: absolute; top: 8px; right: 8px;';
      btn.onclick = async () => {
        const text = code.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      };
      wrapper.appendChild(btn);
    });
  }, []);

  return null;
}
