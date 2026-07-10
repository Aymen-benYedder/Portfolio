import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'motion/react';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
  decimals = 0,
  formatter,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  // Start at end so SSR + initial client render shows the correct number.
  // On animation trigger, we jump to 0 then animate up — the jump is
  // imperceptible (same frame as the animate() call).
  const count = useMotionValue(end);
  const rounded = useTransform(count, (v) => {
    if (formatter) return formatter(v);
    return v.toFixed(decimals);
  });

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      count.set(0);
      const controls = animate(count, end, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    }
  }, [isInView, count, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}


