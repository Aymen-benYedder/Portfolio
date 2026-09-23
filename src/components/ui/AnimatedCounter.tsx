import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  decimals?: number;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  delay = 0,
  className = '',
  decimals = 0,
  formatter,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Vertical-only rootMargin: a full '-100px' shrinks the viewport on ALL
  // sides, which can exclude elements sitting inside the page's horizontal
  // padding (e.g. the first hero stat at left:64px) from ever intersecting.
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });
  const hasAnimated = useRef(false);
  const reducedMotion = useReducedMotion();

  // Start at end so SSR + initial client render shows the correct number.
  // When a delay is configured, drop to 0 on mount (hidden by the hero
  // entrance's opacity:0) so the final value never flashes before the
  // count-up begins.
  const count = useMotionValue(end);
  const rounded = useTransform(count, (v) => {
    if (formatter) return formatter(v);
    return v.toFixed(decimals);
  });

  useEffect(() => {
    if (delay > 0) {
      count.set(0);
    }
  }, [delay, count]);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const effectiveDelay = reducedMotion ? 0 : delay;
      let controls: { stop: () => void } | undefined;
      const timeout = setTimeout(() => {
        count.set(0);
        controls = animate(count, end, {
          duration,
          ease: [0.16, 1, 0.3, 1],
        });
      }, effectiveDelay * 1000);
      return () => {
        clearTimeout(timeout);
        controls?.stop();
      };
    }
  }, [isInView, count, end, duration, delay, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}


