import { AnimatedCounter } from '@components/ui/AnimatedCounter';

const stats = [
  { end: 24, suffix: '+', label: 'Projects', sublabel: 'shipped to production' },
  { end: 8, suffix: '+ yrs', label: 'Experience', sublabel: 'production experience', accent: false },
  { end: 65, suffix: '%', label: 'Faster Deploy', sublabel: 'average improvement across clients' },
  { end: 99.9, suffix: '%', label: 'Uptime', sublabel: '· last 12 months across managed infra', decimals: 1 },
];

export default function StatsSection() {
  return (
    <div className="flex flex-wrap gap-x-[var(--spacing-gap-xl)] gap-y-[var(--spacing-gap-sm)]">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-[10px]">
          <span
            className="font-[family-name:var(--font-mono)] text-[clamp(1.5rem,3vw,2.25rem)] font-bold tabular-nums"
            style={{ color: stat.accent === false ? 'var(--text-1)' : 'var(--accent)' }}
          >
            <AnimatedCounter end={stat.end} suffix={stat.suffix} duration={2 + i * 0.3} decimals={stat.decimals || 0} />
          </span>
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-2xs)] text-[var(--text-1)] font-medium">
              {stat.label}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-3)]">
              {stat.sublabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
