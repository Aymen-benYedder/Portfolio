import { useEffect, useRef } from 'react';

/* ── SCENE TYPES ── */
interface TypewriterScene {
  type: 'typewriter';
  command: string;
  output: string[];
  charInterval: number;
}

interface AnimationScene {
  type: 'animation';
  command: string;
  /** Frame interval in ms */
  frameInterval: number;
  /** Each frame is an array of lines to display */
  frames: string[][];
  /** Whether the animation loops or stops on last frame */
  loop: boolean;
}

type Scene = TypewriterScene | AnimationScene;

/* ── STATE ── */
interface SceneState {
  sceneIdx: number;
  phase: 'intro' | 'typing' | 'output' | 'animation' | 'pause';
  charPos: number;
  elapsed: number;
  frameIdx: number;
}

const MAX_SCROLLBACK = 1500;

/* ══════════════════════════════════════════════════════════════
   SCENE 1 — BOOT SEQUENCE (typewriter)
   ══════════════════════════════════════════════════════════════ */
const bootLines: string[] = [
  '[  OK  ] Kernel 6.8.0-arch1-1',
  '[  OK  ] Mounted /proc, /sys, /dev',
  '[  OK  ] Started Network Manager',
  '[  OK  ] Started Docker Application Engine',
  '[  OK  ] Started PostgreSQL 16',
  '[  OK  ] Initializing DevOps environment...',
  '[  OK  ] System ready.',
  '',
];

/* ══════════════════════════════════════════════════════════════
   SCENE 2 — WHOAMI (typewriter)
   ══════════════════════════════════════════════════════════════ */
const whoamiLines: string[] = [
  'aymen',
  '',
];

/* ══════════════════════════════════════════════════════════════
   SCENE 3 — CI/CD PIPELINE DEPLOY (animation)
   Animated drawing of a deployment pipeline with stages that
   light up one by one and show a filling progress bar.
   ══════════════════════════════════════════════════════════════ */

const pipelineFrames: string[][] = [
  /* frame 0 — all stages pending */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║      ○  LINT                 ║',
    '║      ○  TEST                 ║',
    '║      ○  BUILD                ║',
    '║      ○  DEPLOY               ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 1 — lint running 60% */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ◇ LINT  ████████░░░░ 60% ║',
    '║      ○  TEST                 ║',
    '║      ○  BUILD                ║',
    '║      ○  DEPLOY               ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 2 — lint done, test running 40% */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ✓  LINT                   ║',
    '║    ◇ TEST  ██████░░░░░░ 40% ║',
    '║      ○  BUILD                ║',
    '║      ○  DEPLOY               ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 3 — lint+test done, build running 50% */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ✓  LINT                   ║',
    '║    ✓  TEST                   ║',
    '║    ◇ BUILD ███████░░░░░░ 50%║',
    '║      ○  DEPLOY               ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 4 — lint+test+build done, deploy running 30% */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ✓  LINT                   ║',
    '║    ✓  TEST                   ║',
    '║    ✓  BUILD                  ║',
    '║    ◇ DEPLOY ████░░░░░░░ 30% ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 5 — deploy at 80% */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ✓  LINT                   ║',
    '║    ✓  TEST                   ║',
    '║    ✓  BUILD                  ║',
    '║    ◇ DEPLOY ██████████░░ 80%║',
    '╚══════════════════════════════╝',
  ],
  /* frame 6 — DONE! */
  [
    '╔══════════════════════════════╗',
    '║     PIPELINE · PRODUCTION    ║',
    '╠══════════════════════════════╣',
    '║    ✓  LINT                   ║',
    '║    ✓  TEST                   ║',
    '║    ✓  BUILD                  ║',
    '║    ✓  DEPLOY → ● LIVE       ║',
    '╚══════════════════════════════╝',
    '',
    '   ● Deployment successful.',
  ],
];

/* ══════════════════════════════════════════════════════════════
   SCENE 4 — SYSTEM MONITOR (animation)
   Animated bars showing CPU / RAM / DISK / NET with values
   that dance up and down like a live dashboard.
   ══════════════════════════════════════════════════════════════ */

function resourceBar(pct: number, width = 12): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function monitorFrame(cpu: number, ram: number, dsk: number, net: number): string[] {
  return [
    '╔══════════════════════════════╗',
    '║     SYSTEM · LIVE            ║',
    '╠══════════════════════════════╣',
    `║  CPU  ${resourceBar(cpu)} ${String(cpu).padStart(3)}% ║`,
    `║  RAM  ${resourceBar(ram)} ${String(ram).padStart(3)}% ║`,
    `║  DISK ${resourceBar(dsk)} ${String(dsk).padStart(3)}% ║`,
    `║  NET  ${resourceBar(net)} ${String(net).padStart(3)}% ║`,
    '╚══════════════════════════════╝',
  ];
}

const monitorFrames: string[][] = [
  monitorFrame(23, 45, 12, 8),
  monitorFrame(47, 52, 28, 35),
  monitorFrame(68, 78, 44, 52),
  monitorFrame(89, 91, 58, 74),
  monitorFrame(72, 82, 72, 88),
  monitorFrame(55, 65, 82, 65),
  monitorFrame(38, 48, 65, 42),
  monitorFrame(18, 32, 42, 25),
];

/* ══════════════════════════════════════════════════════════════
   SCENE 5 — NETWORK DATA FLOW (animation)
   Animated 3-tier architecture showing a data packet moving
   through the system: Client → API → Database → Cache.
   Each frame shows the "active" node highlighted.
   ══════════════════════════════════════════════════════════════ */

const flowFrames: string[][] = [
  /* frame 0 — all nodes, packet at client */
  [
    '╔══════════════════════════════╗',
    '║     DATA FLOW · LIVE         ║',
    '╠══════════════════════════════╣',
    '║                              ║',
    '║  ┌──────┐                    ║',
    '║  │ ● →  │  CLIENT            ║',
    '║  └──┬───┘                    ║',
    '║     │  req                   ║',
    '║  ┌──▼───┐                    ║',
    '║  │      │  API               ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐   ┌───────┐       ║',
    '║  │      │   │       │       ║',
    '║  │ DB   │   │ CACHE │       ║',
    '║  │      │   │       │       ║',
    '║  └──────┘   └───────┘       ║',
    '║                              ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 1 — packet at API */
  [
    '╔══════════════════════════════╗',
    '║     DATA FLOW · LIVE         ║',
    '╠══════════════════════════════╣',
    '║                              ║',
    '║  ┌──────┐                    ║',
    '║  │      │  CLIENT            ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐                    ║',
    '║  │ ● →  │  API               ║',
    '║  └──┬───┘                    ║',
    '║     │  query                 ║',
    '║  ┌──▼───┐   ┌───────┐       ║',
    '║  │      │   │       │       ║',
    '║  │ DB   │   │ CACHE │       ║',
    '║  │      │   │       │       ║',
    '║  └──────┘   └───────┘       ║',
    '║                              ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 2 — packet at database */
  [
    '╔══════════════════════════════╗',
    '║     DATA FLOW · LIVE         ║',
    '╠══════════════════════════════╣',
    '║                              ║',
    '║  ┌──────┐                    ║',
    '║  │      │  CLIENT            ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐                    ║',
    '║  │      │  API               ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐   ┌───────┐       ║',
    '║  │ ● →  │   │       │       ║',
    '║  │ DB   │   │ CACHE │       ║',
    '║  │      │   │       │       ║',
    '║  └──────┘   └───────┘       ║',
    '║                              ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 3 — packet to cache, response flowing back */
  [
    '╔══════════════════════════════╗',
    '║     DATA FLOW · LIVE         ║',
    '╠══════════════════════════════╣',
    '║                              ║',
    '║  ┌──────┐   ← response      ║',
    '║  │      │  CLIENT            ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐   ← data          ║',
    '║  │      │  API               ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──────┐   ┌───────┐       ║',
    '║  │      │   │ ● →   │       ║',
    '║  │ DB   │   │ CACHE │       ║',
    '║  │      │   │       │       ║',
    '║  └──────┘   └───────┘       ║',
    '║                              ║',
    '╚══════════════════════════════╝',
  ],
  /* frame 4 — response reaches client */
  [
    '╔══════════════════════════════╗',
    '║     DATA FLOW · LIVE         ║',
    '╠══════════════════════════════╣',
    '║                              ║',
    '║  ┌──────┐                    ║',
    '║  │   ← ●│  CLIENT  ✓ 200    ║',
    '║  └──┬───┘                    ║',
    '║     │                        ║',
    '║  ┌──▼───┐                    ║',
    '║  │      │  API               ║',
    '║  └──────┘                    ║',
    '║                              ║',
    '║  ┌──────┐   ┌───────┐       ║',
    '║  │      │   │       │       ║',
    '║  │ DB   │   │ CACHE │       ║',
    '║  │      │   │       │       ║',
    '║  └──────┘   └───────┘       ║',
    '║                              ║',
    '╚══════════════════════════════╝',
  ],
];

/* ── ALL SCENES ── */
const SCENES: Scene[] = [
  { type: 'typewriter', command: '',     output: bootLines,    charInterval: 4 },
  { type: 'typewriter', command: 'whoami', output: whoamiLines, charInterval: 60 },
  { type: 'animation',  command: 'deploy --production', frames: pipelineFrames, frameInterval: 900, loop: false },
  { type: 'animation',  command: 'watch --interval=1 system-stats', frames: monitorFrames, frameInterval: 600, loop: true },
  { type: 'animation',  command: 'trace --flow api.example.com', frames: flowFrames, frameInterval: 800, loop: true },
];

/* ── GLITCH EFFECT POOL ── */
const GLITCH_POOL = './-\\|;:!?<>[]{}()_+-=*&^%$#@';

/* ── MATRIX RAIN ── */
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/\\|[]{}()_+-=*&^%$#@!~`';

/* ── MAIN COMPONENT ── */
export default function TerminalAsciiMotion() {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SceneState | null>(null);
  const rafRef = useRef<number>(0);
  const raf2Ref = useRef<number>(0);
  const visibleRef = useRef(false);
  const reducedRef = useRef(false);

  /* ── ENTRANCE + REDUCED MOTION ── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedRef.current = e.matches; };
    mq.addEventListener('change', handler);

    const showTimer = setTimeout(() => {
      visibleRef.current = true;
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.transform = 'translateX(0) scale(1)';
        containerRef.current.style.filter = 'blur(0)';
      }
    }, 600);

    return () => {
      clearTimeout(showTimer);
      mq.removeEventListener('change', handler);
    };
  }, []);

  /* ── MATRIX RAIN ── */
  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.ascii-matrix-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let columns: number[] = [];
    let animId = 0;

    const fontSize = 11;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      const colCount = Math.max(1, Math.ceil(w / 14));
      columns = Array.from({ length: colCount }, () => Math.random() * -150);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (reducedRef.current) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width / 2;
      const h = canvas.height / 2;

      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.fillStyle = 'rgba(8, 10, 10, 0.06)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < columns.length; i++) {
        const x = i * 14;
        const y = columns[i];

        const opacity = 0.08 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.fillText(
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
          x, y
        );

        if (y > 0) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + Math.random() * 0.3})`;
          ctx.fillText(
            MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
            x, y - fontSize - 4
          );
        }

        columns[i] += 0.3 + Math.random() * 0.5;
        if (columns[i] > h + 40) {
          columns[i] = -20 - Math.random() * 80;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── TERMINAL ANIMATION ENGINE ── */
  useEffect(() => {
    const pre = preRef.current;
    const container = containerRef.current;
    if (!pre || !container) return;

    const s: SceneState = {
      sceneIdx: 0,
      phase: 'intro',
      charPos: 0,
      elapsed: 0,
      frameIdx: 0,
    };
    stateRef.current = s;

    let scrollback = '';

    let lastTime = 0;
    let rafId = 0;

    function render(timestamp: number) {
      if (!pre) return;

      /* ── REDUCED MOTION FALLBACK ── */
      if (reducedRef.current) {
        pre.innerText = [
          '┌──────────────────────────────┐',
          '│  aymen@devops:~$ whoami      │',
          '│  aymen                       │',
          '├──────────────────────────────┤',
          '│  DevOps Engineer & PM        │',
          '│  ● Pipeline · Monitor · Flow │',
          '└──────────────────────────────┘',
        ].join('\n');
        return;
      }

      if (lastTime === 0) lastTime = timestamp;
      const dt = timestamp - lastTime;
      lastTime = timestamp;

      const scene = SCENES[s.sceneIdx];
      if (!scene) {
        // Loop back
        s.sceneIdx = 0;
        s.phase = 'intro';
        s.charPos = 0;
        s.elapsed = 0;
        s.frameIdx = 0;
        scrollback = '';
        rafId = requestAnimationFrame(render);
        return;
      }

      s.elapsed += dt;

      /* ===== TYPEWRITER SCENE HANDLING ===== */
      if (scene.type === 'typewriter') {
        switch (s.phase) {
          case 'intro': {
            const charsToAdd = Math.floor(s.elapsed / scene.charInterval);
            const fullOutput = scene.output.join('\n');
            const newPos = Math.min(charsToAdd, fullOutput.length);
            s.charPos = newPos;
            const content = fullOutput.slice(0, newPos);

            let display = scrollback + content;
            if (display.length > MAX_SCROLLBACK) {
              display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
            }
            pre.innerText = display;

            if (s.charPos >= fullOutput.length) {
              s.phase = 'pause';
              s.elapsed = 0;
              scrollback = scrollback + fullOutput + '\n';
              if (scrollback.length > MAX_SCROLLBACK) {
                scrollback = '... (truncated) ...\n' + scrollback.slice(-MAX_SCROLLBACK);
              }
            }
            break;
          }

          case 'typing': {
            const cmd = scene.command;
            const charsToShow = Math.min(
              Math.floor(s.elapsed / scene.charInterval),
              cmd.length
            );
            if (charsToShow > s.charPos) s.charPos = charsToShow;

            const typedPart = cmd.slice(0, s.charPos);
            const remainingLen = cmd.length - s.charPos;
            let glitch = '';
            if (remainingLen > 0 && s.charPos > 0) {
              glitch = GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
            }

            const promptLine = `aymen@devops:~$ ${typedPart}${glitch}`;

            if (s.charPos >= cmd.length) {
              s.phase = 'output';
              s.elapsed = 0;
              s.charPos = 0;
              scrollback += `aymen@devops:~$ ${cmd}\n`;
              let display = scrollback;
              if (display.length > MAX_SCROLLBACK) {
                display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
              }
              pre.innerText = display;
            } else {
              let display = scrollback + promptLine;
              if (display.length > MAX_SCROLLBACK) {
                display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
              }
              pre.innerText = display;
            }
            break;
          }

          case 'output': {
            const charsToAdd = Math.floor(s.elapsed / scene.charInterval);
            if (charsToAdd > s.charPos) s.charPos = charsToAdd;

            const fullOutput = scene.output.join('\n');
            const typedOutput = fullOutput.slice(0, Math.min(s.charPos, fullOutput.length));

            const isComplete = s.charPos >= fullOutput.length;
            if (isComplete) {
              s.elapsed = 0;
              s.phase = 'animation';
              s.frameIdx = 0;
              scrollback += fullOutput + '\n';
              if (scrollback.length > MAX_SCROLLBACK) {
                scrollback = '... (truncated) ...\n' + scrollback.slice(-MAX_SCROLLBACK);
              }
              let display = scrollback;
              if (display.length > MAX_SCROLLBACK) {
                display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
              }
              pre.innerText = display;
            } else {
              let display = scrollback + typedOutput;
              if (display.length > MAX_SCROLLBACK) {
                display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
              }
              pre.innerText = display;
            }
            break;
          }

          case 'animation': {
            // After typewriter output — skip to next scene
            s.sceneIdx = (s.sceneIdx + 1) % SCENES.length;
            s.phase = 'intro';
            s.charPos = 0;
            s.elapsed = 0;
            s.frameIdx = 0;
            break;
          }

          case 'pause': {
            const cursor = Math.floor(s.elapsed / 500) % 2 === 0 ? '_' : ' ';
            let display = scrollback + `aymen@devops:~$ ${cursor}`;
            if (display.length > MAX_SCROLLBACK) {
              display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
            }
            pre.innerText = display;

            if (s.elapsed > 1200) {
              s.phase = 'typing';
              s.charPos = 0;
              s.elapsed = 0;
            }
            break;
          }
        }
      }

      /* ===== ANIMATION SCENE HANDLING ===== */
      if (scene.type === 'animation') {
        switch (s.phase) {
          case 'intro': {
            // Show "Running command..." briefly
            if (s.elapsed > 400) {
              scrollback += `aymen@devops:~$ ${scene.command}\n`;
              if (scrollback.length > MAX_SCROLLBACK) {
                scrollback = '... (truncated) ...\n' + scrollback.slice(-MAX_SCROLLBACK);
              }
              s.phase = 'typing';
              s.elapsed = 0;
            }
            let display = scrollback + `aymen@devops:~$ ${scene.command}\n`;
            if (display.length > MAX_SCROLLBACK) {
              display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
            }
            pre.innerText = display;
            break;
          }

          case 'typing': {
            // Brief transition, then start animation
            if (s.elapsed > 300) {
              s.phase = 'output';
              s.elapsed = 0;
              s.frameIdx = 0;
            }
            break;
          }

          case 'output': {
            // Animation cycling
            const totalDuration = scene.frames.length * scene.frameInterval;
            const idx = s.elapsed < totalDuration
              ? Math.floor(s.elapsed / scene.frameInterval)
              : scene.loop
                ? Math.floor(s.elapsed % totalDuration / scene.frameInterval)
                : scene.frames.length - 1;

            s.frameIdx = Math.min(idx, scene.frames.length - 1);
            const frame = scene.frames[s.frameIdx];
            const frameText = frame.join('\n');

            let display = scrollback + frameText;
            if (display.length > MAX_SCROLLBACK) {
              display = '... (truncated) ...\n' + display.slice(-MAX_SCROLLBACK);
            }
            pre.innerText = display;

            // If non-looping and we've reached the end, move on
            if (!scene.loop && s.frameIdx >= scene.frames.length - 1) {
              // Stay on last frame for a bit before advancing
              const endElapsed = s.elapsed - (scene.frames.length - 1) * scene.frameInterval;
              if (endElapsed > 3000) {
                scrollback += frameText + '\n';
                if (scrollback.length > MAX_SCROLLBACK) {
                  scrollback = '... (truncated) ...\n' + scrollback.slice(-MAX_SCROLLBACK);
                }
                s.sceneIdx = (s.sceneIdx + 1) % SCENES.length;
                s.phase = 'intro';
                s.charPos = 0;
                s.elapsed = 0;
                s.frameIdx = 0;
              }
            }
            break;
          }

          default: {
            s.phase = 'intro';
            s.elapsed = 0;
            break;
          }
        }
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);
    rafRef.current = rafId;

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ascii-terminal-motion"
      role="img"
      aria-label="Animated terminal simulation showing system boot, DevOps pipeline, system monitoring, and network data flow"
      style={{
        opacity: 0,
        transform: 'translateX(24px) scale(0.96)',
        filter: 'blur(6px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Matrix Rain canvas */}
      <canvas
        aria-hidden="true"
        className="ascii-matrix-rain"
      />

      {/* Terminal window */}
      <div className="ascii-terminal-window">
        {/* Title bar */}
        <div className="ascii-term-titlebar">
          <div className="ascii-term-dots">
            <span className="ascii-dot-red" />
            <span className="ascii-dot-yellow" />
            <span className="ascii-dot-green" />
          </div>
          <span className="ascii-term-title">aymen@devops: ~</span>
          <div className="ascii-term-spacer" />
        </div>

        {/* Terminal content */}
        <div className="ascii-term-body">
          <pre
            ref={preRef}
            className="ascii-term-pre"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* CRT scanlines */}
      <div className="ascii-scanlines" aria-hidden="true" />

      {/* Animated border glow */}
      <div className="ascii-border-glow" aria-hidden="true" />
    </div>
  );
}
