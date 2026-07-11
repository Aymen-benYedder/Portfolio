import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="glass-panel">
      {items.map((item, i) => (
        <div key={i} className="border-b border-[rgba(16,185,129,0.06)] last:border-b-0">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-[var(--card-px)] py-[14px] min-h-[52px] font-[family-name:var(--font-mono)] text-[var(--text-small)] max-md:text-[var(--text-xs)] font-bold text-[var(--text-1)] bg-transparent border-none cursor-pointer text-left hover:bg-[rgba(255,255,255,0.02)] transition-[background_80ms]"
            aria-expanded={openIndex === i}
            aria-controls={`faq-answer-${i}`}
          >
            <span className="flex-1 pr-[var(--spacing-gap-md)]">{item.question}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div
            id={`faq-answer-${i}`}
            className={`grid px-[var(--card-px)] text-[var(--text-small)] text-[var(--text-2)] leading-relaxed transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${openIndex === i ? 'grid-rows-[1fr] pb-[16px]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
