import { useState, useEffect, useRef, useCallback } from 'react';

const FULL_TEXT = [
  'I am Aymen ben Yedder, a DevOps Engineer and Web Systems Architect based in Medenine, Tunisia.',
  '',
  'Over the past 8 years I have designed and operated production infrastructure for food delivery platforms, safety management systems, and on-demand service applications — environments where downtime is expensive and reliability is non-negotiable.',
  '',
  'My core stack includes Docker, NGINX, GitHub Actions, ArgoCD, FluxCD, Prometheus, and Grafana for infrastructure, and React, Node.js, MongoDB, and PostgreSQL for full-stack development. I write about CI/CD patterns and practical DevOps for startups on my technical blog.',
  '',
  'Currently at Alizeth as DevOps Engineer & Project Manager, leading infrastructure automation and delivery pipelines. Available for freelance consulting and remote contract work in 2026.',
];

const PREVIEW_TEXT = 'I am Aymen ben Yedder, a DevOps Engineer and Web Systems Architect based in Medenine, Tunisia.';

interface TerminalAboutProps {
  typingSpeed?: number;
}

export default function TerminalAbout({ typingSpeed = 8 }: TerminalAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [typedPos, setTypedPos] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullText = FULL_TEXT.join('\n');
  const totalChars = fullText.length;

  const stopTyping = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTyping = useCallback(() => {
    setTypedPos(0);
    setIsTyping(true);

    // Calculate dynamic speed: faster initially, slower near end
    let pos = 0;
    timerRef.current = setInterval(() => {
      pos += 1;
      setTypedPos(pos);

      if (pos >= totalChars) {
        stopTyping();
        setIsTyping(false);
      }
    }, typingSpeed);
  }, [totalChars, typingSpeed, stopTyping]);

  const handleExpand = () => {
    setIsExpanded(true);
    // Small delay so the DOM renders before typing starts
    setTimeout(() => startTyping(), 100);
  };

  const handleCollapse = () => {
    stopTyping();
    setIsTyping(false);
    setTypedPos(0);
    setIsExpanded(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTyping();
  }, [stopTyping]);

  // Render typed text as lines
  const renderTypedContent = () => {
    const typed = fullText.slice(0, typedPos);
    const lines = typed.split('\n');
    const isComplete = typedPos >= totalChars;

    return (
      <>
        {lines.map((line, i) => (
          <div key={i} className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span>{line}</span>
            {/* Cursor on last line while typing */}
            {!isComplete && i === lines.length - 1 && (
              <span className="terminal-about-cursor" aria-hidden="true" />
            )}
          </div>
        ))}
        {/* Blinking cursor after completion */}
        {isComplete && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-about-cursor terminal-cursor-done" aria-hidden="true" />
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="terminal-about-wrapper font-[family-name:var(--font-mono)]"
    >
      {/* ── Terminal Frame ── */}
      <div className={`terminal-about ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        {/* Title Bar */}
        <div className="terminal-titlebar">
          <div className="terminal-dots">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <span className="terminal-title">about_aymen.txt — cat</span>
          <div className="terminal-title-spacer" />
        </div>

        {/* Body */}
        <div className="terminal-body">
          {/* Command line (always visible) */}
          <div className="terminal-line terminal-command">
            <span className="terminal-prompt terminal-dollar">$</span>
            <span>cat ~/about.txt</span>
          </div>

          {/* Preview line when collapsed */}
          {!isExpanded && (
            <>
              <div className="terminal-line terminal-preview">
                <span className="terminal-prompt">&gt;</span>
                <span className="terminal-preview-text">{PREVIEW_TEXT}</span>
                <span className="terminal-ellipsis">…</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">&nbsp;</span>
                <span className="terminal-hint">// 3 paragraphs hidden</span>
              </div>
            </>
          )}

          {/* Typing content when expanded */}
          {isExpanded && (
            <div className="terminal-content">
              {renderTypedContent()}
            </div>
          )}
        </div>

        {/* Expand / Collapse Button */}
        <div className="terminal-footer">
          {!isExpanded ? (
            <button
              onClick={handleExpand}
              className="terminal-expand-btn"
              type="button"
              aria-label="Read more about Aymen"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="terminal-btn-icon">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>Read more</span>
              <span className="terminal-btn-hint">— 3 paragraphs · ~45 lines</span>
            </button>
          ) : (
            <button
              onClick={handleCollapse}
              className="terminal-expand-btn terminal-collapse-btn"
              type="button"
              aria-label="Show less"
              disabled={isTyping}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="terminal-btn-icon">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>{isTyping ? 'Typing…' : 'Show less'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
