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

interface StatsGridProps {
  className?: string;
}

const stats = [
  { end: 24, suffix: '+', label: 'Projects Delivered' },
  { end: 8, suffix: '+ yrs', label: 'Experience' },
  { end: 100, suffix: '%', label: 'Uptime', prefix: '99.' },
];

export function StatsGrid({ className = '' }: StatsGridProps) {
  return (
    <div className={`flex gap-[var(--spacing-gap-lg)] max-sm:flex-col max-sm:gap-[var(--spacing-gap-sm)] ${className}`}>
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col" style={{ transitionDelay: `${i * 100}ms` }}>
          <span className="font-[family-name:var(--font-mono)] text-[28px] max-md:text-[22px] font-bold text-[var(--text-1)] tracking-tight">
            <AnimatedCounter
              end={stat.end}
              suffix={stat.suffix}
              prefix={'prefix' in stat ? (stat as any).prefix : ''}
              duration={2 + i * 0.3}
            />
          </span>
          <span className="text-[var(--text-3)] text-[11px] font-[family-name:var(--font-mono)] tracking-[0.05em] uppercase">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
