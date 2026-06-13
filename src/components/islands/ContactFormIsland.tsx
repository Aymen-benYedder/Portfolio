import { useState, type FormEvent } from 'react';

const inputClass = "font-[family-name:var(--font-mono)] text-[var(--text-xs)] text-[var(--text-1)] bg-[var(--inset)] border px-[14px] py-[12px] min-h-[44px] outline-none w-full transition-all duration-200 placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:shadow-[0_0_8px_rgba(16,185,129,0.15)]";
const inputError = "border-[var(--error)]";
const inputNormal = "border-[var(--border)]";

export default function ContactFormIsland() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailErr, setEmailErr] = useState('');

  const validateEmail = (v: string) => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    setEmailErr(ok || !v ? '' : 'Invalid email format');
    return ok;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    if (!validateEmail(email)) return;
    setStatus('sending');
    const data = new FormData(form);
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        setStatus('sent');
        form.reset();
        setEmailErr('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form id="contact-form" className="card glass-hover hover-lift px-[var(--card-px)] py-[var(--card-py)]" action="https://api.web3forms.com/submit" method="POST" onSubmit={handleSubmit}>
      <input type="hidden" name="access_key" value="0888c0d1-a716-4c5d-a271-733bfb3be2bc" />
      <input type="hidden" name="subject" value="New Contact Form Submission from Portfolio" />
      <input type="hidden" name="from_name" value="Portfolio Contact Form" />

      <div className="space-y-[var(--spacing-gap-md)]">
        <div className="form-group">
          <label htmlFor="name" className="label-caps text-[var(--text-3)] mb-[6px] block">Full Name</label>
          <input type="text" id="name" name="name" placeholder="Your Name" required
            className={`${inputClass} ${inputNormal}`}
            aria-required="true" autoComplete="name" />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="label-caps text-[var(--text-3)] mb-[6px] block">Email Address</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required
            className={`${inputClass} ${emailErr ? inputError : inputNormal}`}
            aria-required="true" autoComplete="email"
            onBlur={(e) => validateEmail(e.target.value)}
            onChange={(e) => { if (emailErr) validateEmail(e.target.value); }} />
          {emailErr && <p className="text-[var(--error)] text-[var(--text-2xs)] mt-[4px] font-[family-name:var(--font-mono)]" role="alert">{emailErr}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="project_type" className="label-caps text-[var(--text-3)] mb-[6px] block">Project Type</label>
          <div className="relative">
            <select id="project_type" name="project_type" required
              className={`${inputClass} ${inputNormal} appearance-none pr-[36px]`}>
              <option value="" className="text-[var(--text-3)]">Select Project Type</option>
              <option value="mern">MERN Stack</option>
              <option value="wordpress">WordPress</option>
              <option value="custom">Custom Development</option>
              <option value="optimization">Optimization &amp; Maintenance</option>
              <option value="other">Other</option>
            </select>
            <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-3)]" width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="label-caps text-[var(--text-3)] mb-[6px] block">Message</label>
          <textarea id="message" name="message" placeholder="Tell me about your project..." required rows={4}
            className={`${inputClass} ${inputNormal}`}
            aria-required="true" />
        </div>

        <button type="submit" disabled={status === 'sending'}
          className={`w-full font-[family-name:var(--font-mono)] text-[var(--text-2xs)] font-bold tracking-[0.1em] px-[20px] py-[12px] min-h-[44px] uppercase border cursor-pointer transition-all duration-200 bg-[var(--accent)] border-[var(--accent)] text-[var(--void)] hover:bg-transparent hover:text-[var(--accent)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-70 ${status === 'sending' ? 'animate-pulse-send' : ''}`}>
          {status === 'sending' ? '[ TRANSMITTING... ]' : '[ SEND MESSAGE ]'}
        </button>

        {status === 'sent' && <p className="text-[var(--success)] text-[var(--text-xs)] text-center font-[family-name:var(--font-mono)] label-caps" role="alert">Message sent successfully.</p>}
        {status === 'error' && <p className="text-[var(--error)] text-[var(--text-xs)] text-center font-[family-name:var(--font-mono)] label-caps" role="alert">Failed to send. Try emailing directly.</p>}
      </div>
    </form>
  );
}
