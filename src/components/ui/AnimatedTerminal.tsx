import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalLine {
  command: string;
  output?: string;
  delay: number;
}

const LINES: TerminalLine[] = [
  {
    command: 'cat about.md',
    output:
      'Aymen ben Yedder\nDevOps Engineer & Web Systems Architect\nMedenine, Tunisia · 8+ years in production\n\nDesigned and operated infrastructure for food delivery platforms, safety management systems, and on-demand service applications — environments where downtime is expensive and reliability is non-negotiable.',
    delay: 800,
  },
  {
    command: 'cat stack.md',
    output:
      'Infrastructure: Docker, NGINX, GitHub Actions, ArgoCD, FluxCD, Prometheus, Grafana\nFull-Stack: React, Node.js, MongoDB, PostgreSQL\n\nWriting about CI/CD patterns, type-safe API design with Hono and TanStack, and practical DevOps for startup teams.',
    delay: 600,
  },
  {
    command: 'cat current.md',
    output:
      'Current: DevOps Engineer & Project Manager at Alizeth\nLeading infrastructure automation and delivery pipelines.\n\nAvailable for freelance consulting and remote contract work in 2026.\nLanguages: Arabic (native), English (advanced), French (fluent)',
    delay: 1000,
  },
];

function useTypingAnimation(text: string, speed = 30, startDelay = 0) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let index = 0;

    const startTyping = () => {
      timeout = setTimeout(function type() {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
          // Variable speed: faster for spaces, slower for special chars
          const char = text[index];
          const delay = char === ' ' ? speed * 0.3 : '.:;,'.includes(char || '') ? speed * 2 : speed;
          timeout = setTimeout(type, delay);
        } else {
          setIsDone(true);
        }
      }, speed);
    };

    if (startDelay > 0) {
      timeout = setTimeout(startTyping, startDelay);
    } else {
      startTyping();
    }

    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, isDone };
}

function TerminalLineComponent({ line, index: lineIndex, onComplete }: { line: TerminalLine; index: number; onComplete: () => void }) {
  const [showingOutput, setShowingOutput] = useState(false);
  const { displayed: cmdText, isDone: cmdDone } = useTypingAnimation(line.command, 40, lineIndex * line.delay);
  const { displayed: outText, isDone: outDone } = useTypingAnimation(line.output || '', 8, 0);

  useEffect(() => {
    if (cmdDone && line.output) {
      const t = setTimeout(() => setShowingOutput(true), 300);
      return () => clearTimeout(t);
    }
  }, [cmdDone, line.output]);

  useEffect(() => {
    if (outDone) {
      onComplete();
    }
  }, [outDone, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-[6px]"
    >
      <div className="flex items-start gap-[8px]">
        <span className="text-[var(--accent)] select-none shrink-0 mt-[2px]" style={{ textShadow: '0 0 4px rgba(16,185,129,0.5)' }}>
          ❯
        </span>
        <span className="text-[var(--text-1)] whitespace-pre-wrap">{cmdText}</span>
        {!cmdDone && (
          <span className="inline-block w-[6px] h-[12px] bg-[var(--accent)] mt-[2px]" style={{ animation: 'blink 1.1s step-end infinite', boxShadow: '0 0 4px var(--accent)' }} />
        )}
      </div>
      {showingOutput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="ml-[20px] mt-[4px]"
        >
          <pre className="text-[var(--text-3)] font-[family-name:var(--font-mono)] text-[11px] leading-[1.6] whitespace-pre-wrap m-0">
            {outText}
            {!outDone && <span className="inline-block w-[4px] h-[10px] bg-[var(--accent)] ml-[2px]" style={{ animation: 'blink 1.1s step-end infinite' }} />}
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AnimatedTerminal() {
  const [activeLines, setActiveLines] = useState(1);
  const [allDone, setAllDone] = useState(false);

  const handleLineComplete = useCallback(() => {
    setActiveLines((prev) => {
      const next = prev + 1;
      if (next >= LINES.length) {
        setTimeout(() => setAllDone(true), 1500);
      }
      return Math.min(next, LINES.length);
    });
  }, []);

  return (
    <div className="glass-panel relative font-[family-name:var(--font-mono)] text-[12px] leading-[1.75] overflow-hidden terminal-corner" data-simulated="true">
      {/* Terminal title bar */}
      <div className="flex items-center gap-[6px] px-[14px] py-[10px] border-b border-[rgba(16,185,129,0.1)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <span className="w-[10px] h-[10px]" style={{ background: '#FF5F57' }} />
        <span className="w-[10px] h-[10px]" style={{ background: '#FEBC2E' }} />
        <span className="w-[10px] h-[10px]" style={{ background: '#28C840' }} />
        <span className="text-[var(--text-3)] text-[10px] tracking-[0.02em]">aymen@portfolio ~/mission-control</span>
        <span className="ml-auto text-[var(--accent)] text-[10px] tracking-[0.05em] flex items-center gap-[4px]">
          <span className="w-[4px] h-[4px] bg-[var(--accent)] rounded-full" style={{ boxShadow: '0 0 4px var(--accent)' }} />
          SIMULATED
        </span>
      </div>

      {/* Terminal body */}
      <div className="px-[var(--card-px)] py-[var(--card-py)] min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {LINES.slice(0, activeLines).map((line, i) => (
            <TerminalLineComponent key={i} line={line} index={i} onComplete={handleLineComplete} />
          ))}
        </AnimatePresence>

        {/* Final prompt */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-[8px]"
          >
            <span className="text-[var(--accent)] select-none" style={{ textShadow: '0 0 4px rgba(16,185,129,0.5)' }}>❯ </span>
            <span className="inline-block w-[8px] h-[14px] bg-[var(--accent)] align-text-bottom" style={{ animation: 'blink 1.1s step-end infinite', boxShadow: '0 0 4px var(--accent)' }} />
          </motion.div>
        )}
      </div>
      <span className="absolute bottom-1 right-2 text-[9px] text-[var(--text-3)] opacity-40 font-[family-name:var(--font-mono)]">simulated</span>
    </div>
  );
}
