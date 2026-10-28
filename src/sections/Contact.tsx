import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { company, contact, drawing, sectionIds, workOrder } from '../content';
import { isProd } from '../env';
import { postForm } from '../lib/api';
import { consumePendingSubject, onContactPrefill, peekPendingSubject } from '../lib/contactBridge';
import { recaptchaSiteKey } from '../lib/links';
import { isRealEmail } from '../lib/placeholder';
import { validateContact, validateField, type ContactErrors, type ContactValues } from '../lib/validation';
import { Icon } from '../components/Icon';
import { CompanyContact } from '../components/LegalLayout';
import { Recaptcha } from '../components/Recaptcha';
import { SectionTag } from '../components/Drawing';

type Status = 'idle' | 'sending' | 'success' | 'error';

const empty: ContactValues = { name: '', email: '', company: '', subject: '', message: '' };

function MapIllustration() {
  return (
    <svg viewBox="0 0 360 200" width="360" height="200" className="w-full h-auto block" role="img" aria-label={contact.mapAlt}>
      <defs>
        <radialGradient id="map-glow" cx="58%" cy="48%" r="40%">
          <stop offset="0" stopColor="#FF85BB" stopOpacity="0.5" />
          <stop offset="1" stopColor="#021A54" stopOpacity="0" />
        </radialGradient>
        <pattern id="map-grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="#FFCEE3" strokeOpacity="0.07" />
        </pattern>
      </defs>
      <rect width="360" height="200" fill="#021A54" />
      <rect width="360" height="200" fill="url(#map-grid)" />
      <path d="M-10 150 C 60 120, 120 170, 190 120 S 300 60, 370 90" fill="none" stroke="#FFCEE3" strokeOpacity="0.18" strokeWidth="14" />
      <g stroke="#FFCEE3" strokeOpacity="0.32" strokeWidth="3" fill="none">
        <path d="M0 60h360M0 112h120l40 30h200M90 0v200M250 0v70l-30 40v90" />
      </g>
      <g stroke="#FFCEE3" strokeOpacity="0.14" strokeWidth="1.5" fill="none">
        <path d="M0 30h360M0 170h360M40 0v200M150 0v200M310 0v200M200 0v200" />
      </g>
      <rect width="360" height="200" fill="url(#map-glow)" />
      <g transform="translate(209 96)">
        <circle r="26" fill="#FF85BB" opacity="0.18" />
        <circle r="14" fill="#FF85BB" opacity="0.35" />
        <path d="M0 6 C -10 -6, -12 -12, -12 -18 a12 12 0 0 1 24 0 c0 6 -2 12 -12 24z" fill="#FF85BB" stroke="#F5F5F5" strokeWidth="1.5" transform="translate(0 -12)" />
        <circle cy="-30" r="4.5" fill="#021A54" />
      </g>
    </svg>
  );
}

function ContactForm() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<ContactValues>(() => {
    const pending = peekPendingSubject();
    return pending && contact.subjects.includes(pending) ? { ...empty, subject: pending } : empty;
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [hp, setHp] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  const captchaRequired = Boolean(recaptchaSiteKey);

  // Subject prefill from pricing, chatbot and banners.
  useEffect(() => {
    consumePendingSubject();
    return onContactPrefill((subject) => {
      if (contact.subjects.includes(subject)) {
        setValues((v) => ({ ...v, subject }));
        setErrors((e) => ({ ...e, subject: undefined }));
        setStatus((s) => (s === 'success' ? 'idle' : s));
      }
    });
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  const onToken = useCallback((t: string | null) => {
    setToken(t);
    if (t) setCaptchaError(false);
  }, []);

  function setField(field: keyof ContactValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validateField(field, value) }));
  }

  function onBlur(field: keyof ContactValues) {
    const message = validateField(field, values[field]);
    setErrors((e) => ({ ...e, [field]: message }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof ContactValues)[])[0];
    const missingCaptcha = captchaRequired && !token;
    setCaptchaError(missingCaptcha);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (missingCaptcha) return;

    setStatus('sending');
    setServerMessage('');
    controller.current?.abort();
    controller.current = new AbortController();
    const result = await postForm(
      {
        type: 'contact',
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        subject: values.subject,
        message: values.message.trim(),
        hp_field: hp,
        recaptchaToken: token ?? '',
      },
      controller.current.signal,
    );
    if (result.ok) {
      setStatus('success');
      setValues(empty);
      setErrors({});
    } else if (result.code !== 'aborted') {
      setStatus('error');
      setServerMessage(
        result.code === 'rate_limited' ? contact.errors.rateLimited : result.code === 'captcha_failed' ? contact.errors.captcha : contact.errors.server,
      );
    }
    if (captchaRequired) setResetKey((k) => k + 1);
  }

  const field = (name: keyof ContactValues) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-err` : undefined,
    onBlur: () => onBlur(name),
  });

  const errorText = (name: keyof ContactValues) =>
    errors[name] ? (
      <p id={`${id}-${name}-err`} className="field-error">
        <Icon name="alert" size={18} className="shrink-0 mt-0.5" />
        {errors[name]}
      </p>
    ) : null;

  if (status === 'success') {
    return (
      <div className="panel crop p-8 sm:p-10 grid gap-5 content-start min-h-[32rem]" role="status" aria-live="polite" data-testid="contact-success">
        <p className="mono text-[0.75rem] uppercase tracking-[0.14em] text-blush">
          {workOrder.referenceLabel} {workOrder.reference}
        </p>
        <span className="stamp text-pink w-fit -rotate-3">
          <Icon name="check" size={18} />
        </span>
        <p className="display text-[clamp(2rem,1.5rem+1.6vw,3rem)]">{contact.success}</p>
        <button type="button" className="btn btn-ghost w-fit" onClick={() => setStatus('idle')}>
          {contact.sendAnother}
        </button>
      </div>
    );
  }

  const cell = (name: keyof ContactValues, ref: string, label: string, control: ReactNode, extra?: ReactNode) => (
    <div className="wo-cell">
      <div className="wo-label">
        <label htmlFor={`${id}-${name}`}>{label}</label>
        <span className="wo-ref" aria-hidden="true">
          {ref}
        </span>
      </div>
      {control}
      {errorText(name)}
      {extra}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="panel crop" aria-labelledby="contact-title" data-testid="contact-form">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b hairline">
        <p className="display text-[1.75rem]">{workOrder.title}</p>
        <p className="mono text-[0.75rem] tracking-[0.12em] text-blush">
          {workOrder.referenceLabel} {workOrder.reference}
        </p>
      </div>
      <p className="px-5 pt-4 pb-2 text-small text-muted">{contact.requiredNote}</p>
      <div className="grid sm:grid-cols-2 pl-px pt-px">
        {cell(
          'name',
          workOrder.cells.name,
          contact.fields.name.label,
          <input {...field('name')} type="text" autoComplete="name" className="wo-input" maxLength={contact.fields.name.max} required onChange={(e) => setField('name', e.target.value)} />,
        )}
        {cell(
          'email',
          workOrder.cells.email,
          contact.fields.email.label,
          <input
            {...field('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="wo-input"
            maxLength={contact.fields.email.max}
            required
            onChange={(e) => setField('email', e.target.value)}
          />,
        )}
        {cell(
          'company',
          workOrder.cells.company,
          contact.fields.company.label,
          <input {...field('company')} type="text" autoComplete="organization" className="wo-input" maxLength={contact.fields.company.max} onChange={(e) => setField('company', e.target.value)} />,
        )}
        {cell(
          'subject',
          workOrder.cells.subject,
          contact.fields.subject.label,
          <select {...field('subject')} className="wo-input" required onChange={(e) => setField('subject', e.target.value)} data-testid="contact-subject">
            <option value="" disabled>
              {contact.subjectPlaceholder}
            </option>
            {contact.subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>,
        )}
        <div className="sm:col-span-2 grid">
          {cell(
            'message',
            workOrder.cells.message,
            contact.fields.message.label,
            <textarea {...field('message')} className="wo-input" rows={5} maxLength={contact.fields.message.max} required onChange={(e) => setField('message', e.target.value)} />,
            <p className="justify-self-end mono text-[0.6875rem] text-blush tabular" aria-hidden="true">
              {values.message.length} / {contact.fields.message.max}
            </p>,
          )}
        </div>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${id}-hp`}>{contact.honeypotLabel}</label>
        <input id={`${id}-hp`} type="text" name="hp_field" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>

      <div className="px-5 py-5 border-t hairline grid gap-5">
        {captchaRequired ? (
          <div>
            <p className="wo-ref mb-2" aria-hidden="true">
              {workOrder.cells.check}
            </p>
            <Recaptcha siteKey={recaptchaSiteKey} trigger={formRef} onToken={onToken} resetKey={resetKey} describedBy={captchaError ? `${id}-captcha-err` : undefined} />
            {captchaError ? (
              <p id={`${id}-captcha-err`} className="field-error" role="alert">
                <Icon name="alert" size={18} className="shrink-0 mt-0.5" />
                {contact.errors.captcha}
              </p>
            ) : null}
            <p className="mt-2 text-[0.8125rem] text-muted">{contact.captchaNotice}</p>
          </div>
        ) : (
          <p className="text-small text-blush flex items-start gap-2" role="note">
            <Icon name="info" size={18} className="shrink-0 mt-0.5" />
            {contact.devCaptchaNote}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button type="submit" className="btn btn-primary shimmer" disabled={status === 'sending'} aria-disabled={status === 'sending'} data-testid="contact-submit">
            {status === 'sending' ? (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-navy border-t-transparent spin-fast" aria-hidden="true" />
                {contact.sending}
              </>
            ) : (
              <>
                {contact.submit}
                <Icon name="send" size={18} />
              </>
            )}
          </button>
          <p role="status" aria-live="polite" className="text-small min-h-[1.5rem]" data-testid="contact-status">
            {status === 'error' ? (
              <span className="inline-flex items-start gap-2 text-blush">
                <Icon name="alert" size={18} className="shrink-0 mt-0.5" />
                {serverMessage}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </form>
  );
}

export function Contact() {
  // A production build without a site key cannot pass the server check, so it says so.
  const notConfigured = isProd && !recaptchaSiteKey;
  const showEmail = isRealEmail(company.email);
  return (
    <section id={sectionIds.contact} aria-labelledby="contact-title" className="section drawing atmosphere">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionTag id={sectionIds.contact} />
            <h2 id="contact-title" className="mt-4" data-reveal>
              {contact.heading}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 grid gap-3">
            {contact.intro.map((p) => (
              <p key={p} className="lead text-muted" data-reveal>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7" data-reveal>
            <div className="mb-6">
              <p className="section-tag">
                <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
                {workOrder.title}
              </p>
              <h3 className="mt-3 display !text-[clamp(2rem,1.5rem+1.6vw,3rem)]">{contact.workOrderHeading}</h3>
              {contact.workOrderText.map((p) => (
                <p key={p} className="mt-2 text-muted">
                  {p}
                </p>
              ))}
              <p className="mt-4 inline-flex items-center gap-2 mono text-[0.75rem] uppercase tracking-[0.12em] text-blush">
                {contact.availabilityLabel}
                <span className={notConfigured ? 'text-light/80' : 'text-pink'} data-testid="contact-availability">
                  {notConfigured ? contact.availabilityClosed : contact.availabilityOpen}
                </span>
              </p>
            </div>
            {notConfigured ? (
              <div className="panel crop p-8 grid gap-3 content-start" role="note" data-testid="contact-not-configured">
                <p className="display text-[1.75rem]">{workOrder.title}</p>
                <span className="icon-tile">
                  <Icon name="alert" />
                </span>
                <p className="font-semibold">{contact.notConfigured}</p>
              </div>
            ) : (
              <ContactForm />
            )}
          </div>

          {/* Company details as a drawing title block */}
          <aside className="lg:col-span-5 border border-blush/40" aria-labelledby="contact-titleblock" data-reveal>
            <div className="flex items-center justify-between px-5 py-3 border-b border-blush/40">
              <h3 id="contact-titleblock" className="mono !text-[0.75rem] uppercase tracking-[0.14em] text-blush !font-medium">
                {workOrder.titleBlock} / {contact.infoHeading}
              </h3>
              <span className="mono text-[0.6875rem] text-blush/70" aria-hidden="true">
                {drawing.labels.titleBlockCode}
              </span>
            </div>
            <div className="p-5">
              <CompanyContact />
            </div>
            <div className="border-t border-blush/40">
              <MapIllustration />
            </div>
            {showEmail ? (
              <p className="px-5 py-3 border-t border-blush/40 text-small">
                {contact.preferEmail}{' '}
                <a className="link" href={`mailto:${company.email}`}>
                  {contact.preferEmailLink}
                </a>
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
