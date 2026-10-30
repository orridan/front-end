import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { footer, newsletter } from '../content';
import { postForm } from '../lib/api';
import { isValidEmail } from '../lib/placeholder';
import { Icon } from './Icon';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function Newsletter() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  // Clear the success line after a moment so the form is ready for the next sign-up.
  useEffect(() => {
    if (status !== 'success') return;
    const timer = window.setTimeout(() => setStatus('idle'), newsletter.successResetMs);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!isValidEmail(email.trim())) {
      setError(newsletter.invalid);
      return;
    }
    setError(null);
    setStatus('sending');
    controller.current?.abort();
    controller.current = new AbortController();
    const result = await postForm(
      newsletter.endpoint,
      { email: email.trim(), _subject: newsletter.emailSubject, _gotcha: hp },
      controller.current.signal,
    );
    if (result.ok) {
      setStatus('success');
      setEmail('');
    } else if (result.code !== 'aborted') {
      setStatus('error');
    }
  }

  const errorId = `${id}-error`;
  const statusId = `${id}-status`;

  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5 flex items-start gap-4">
        <span className="stamp text-pink shrink-0 -rotate-2 !text-[0.6875rem]" aria-hidden="true">
          {footer.titleBlock.revisionRequest}
        </span>
        <div>
          <h2 className="!text-[2rem]">{newsletter.heading}</h2>
          <p className="mt-1 text-small text-muted">{newsletter.text}</p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="grid gap-2 lg:col-span-7" aria-describedby={statusId}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="field flex-1">
            <input
              id={`${id}-email`}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder=" "
              className="field-input"
              value={email}
              maxLength={254}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
                if (status === 'error' || status === 'success') setStatus('idle');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              required
            />
            <label htmlFor={`${id}-email`} className="field-label">
              {newsletter.label}
            </label>
          </div>
          <div className="hp-field" aria-hidden="true">
            <label htmlFor={`${id}-hp`}>{newsletter.honeypotLabel}</label>
            <input id={`${id}-hp`} type="text" name="hp_field" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary shimmer sm:self-stretch" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
            {status === 'sending' ? newsletter.sending : newsletter.submit}
          </button>
        </div>
        {error ? (
          <p id={errorId} className="field-error" role="alert">
            <Icon name="alert" size={18} />
            {error}
          </p>
        ) : null}
        <p id={statusId} role="status" aria-live="polite" className="min-h-[1.5rem] text-small">
          {status === 'success' ? (
            <span className="inline-flex items-center gap-2 text-blush">
              <Icon name="check" size={18} />
              {newsletter.success}
            </span>
          ) : null}
          {status === 'error' ? (
            <span className="inline-flex items-center gap-2 text-blush">
              <Icon name="alert" size={18} />
              {newsletter.error}
            </span>
          ) : null}
        </p>
      </form>
    </div>
  );
}
