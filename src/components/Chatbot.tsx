import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { AnimatePresence, m } from 'framer-motion';
import { chatbot, routes, sectionIds } from '../content';
import { answerById, matchQuestion, type ChatAction, type MatchResult } from '../lib/chatMatcher';
import { requestContact } from '../lib/contactBridge';
import { OPEN_CHAT_EVENT } from '../lib/events';
import { readJson, writeJson } from '../lib/storage';
import { Icon } from './Icon';
import { LogoMark } from './Logo';

type Message = { id: number; from: 'bot' | 'user'; text: string; action?: ChatAction };

const MAX_STORED = 40;

function loadMessages(): Message[] {
  const stored = readJson<Message[]>('session', chatbot.storageKey);
  if (Array.isArray(stored) && stored.every((m) => typeof m?.text === 'string' && (m.from === 'bot' || m.from === 'user'))) {
    return stored.slice(-MAX_STORED);
  }
  return [];
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const navigate = useNavigate();
  const titleId = useId();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(messages.reduce((max, msg) => Math.max(max, msg.id), 0) + 1);

  // Persist the conversation for this tab only.
  useEffect(() => {
    writeJson('session', chatbot.storageKey, messages.slice(-MAX_STORED));
  }, [messages]);

  // Clear any pending reply timer on unmount.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Allow other parts of the page to open the assistant.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  // Focus management: input on open, back to the button on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      const f = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      wasOpen.current = true;
      return () => cancelAnimationFrame(f);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      fabRef.current?.focus({ preventScroll: true });
    }
    return undefined;
  }, [open]);

  // Keep the latest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, typing, open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  function reply(result: MatchResult) {
    window.clearTimeout(timer.current);
    setTyping(true);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: nextId.current++, from: 'bot', text: result.answer, action: result.action }]);
    }, 550);
  }

  function ask(text: string, result: MatchResult) {
    setMessages((prev) => [...prev, { id: nextId.current++, from: 'user', text }]);
    reply(result);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 300);
    if (!text || typing) return;
    setInput('');
    ask(text, matchQuestion(text));
  }

  function goContact() {
    close();
    requestContact(chatbot.fallbackSubject, navigate);
  }

  function goProduct() {
    close();
    navigate(routes.product);
  }

  function goPricing() {
    close();
    navigate({ pathname: '/', hash: `#${sectionIds.pricing}` });
  }

  return createPortal(
    <>
      <button
        ref={fabRef}
        type="button"
        className="chat-fab fixed right-4 sm:right-6 z-chat inline-grid place-items-center w-14 h-14 rounded-pill overflow-hidden btn-primary shadow-lg"
        style={{ bottom: 'calc(1rem + var(--consent-offset, 0px))' }}
        aria-label={open ? chatbot.closeLabel : chatbot.openLabel}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        data-testid="chat-fab"
      >
        <Icon name={open ? 'x' : 'chat'} size={26} />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            key="chat"
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className="chat-panel fixed z-chat right-2 left-2 sm:left-auto sm:right-6 sm:w-[24rem] glass flex flex-col overflow-hidden"
            style={{
              bottom: 'calc(5.5rem + var(--consent-offset, 0px))',
              maxHeight: 'min(36rem, calc(100svh - 7.5rem - var(--consent-offset, 0px)))',
              backgroundColor: 'rgb(var(--c1-rgb) / 0.97)',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            data-testid="chat-panel"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b hairline">
              <LogoMark size={32} />
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="h-plain text-[1.0625rem]">
                  {chatbot.title}
                </h2>
                <p className="text-[0.8125rem] text-blush">{chatbot.disclaimer}</p>
              </div>
              <button type="button" onClick={close} className="inline-grid place-items-center w-11 h-11 rounded-pill border hairline" aria-label={chatbot.closeLabel}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto px-5 py-4 grid gap-3 content-start min-h-[12rem]">
              <Bubble from="bot" text={chatbot.greeting} />
              {messages.map((msg) => (
                <div key={msg.id} className="grid gap-2">
                  <Bubble from={msg.from} text={msg.text} />
                  {msg.from === 'bot' && msg.action === 'contact' ? (
                    <button type="button" onClick={goContact} className="btn btn-ghost btn-sm w-fit">
                      <Icon name="mail" size={18} />
                      {chatbot.fallbackAction}
                    </button>
                  ) : null}
                  {msg.from === 'bot' && msg.action === 'pricing' ? (
                    <button type="button" onClick={goPricing} className="btn btn-ghost btn-sm w-fit">
                      <Icon name="arrowRight" size={18} />
                      {chatbot.pricingAction}
                    </button>
                  ) : null}
                  {msg.from === 'bot' && msg.action === 'product' ? (
                    <button type="button" onClick={goProduct} className="btn btn-ghost btn-sm w-fit">
                      <Icon name="arrowRight" size={18} />
                      {chatbot.productAction}
                    </button>
                  ) : null}
                </div>
              ))}
              {typing ? (
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-lg2 bg-blush/10 w-fit" role="status">
                  <span className="sr-only">{chatbot.typing}</span>
                  {[0, 1, 2].map((i) => (
                    <span key={i} aria-hidden="true" className="blink inline-block w-2 h-2 rounded-pill bg-blush" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="px-5 pt-1 pb-3 flex flex-wrap gap-2" aria-label={chatbot.quickRepliesLabel} role="group">
              {chatbot.quickReplies.map((chip) => (
                <button
                  key={chip.intent}
                  type="button"
                  className="min-h-[40px] px-3 rounded-pill border hairline text-[0.875rem] text-light/90 hover:text-light hover:border-pink"
                  onClick={() => ask(chip.label, answerById(chip.intent))}
                  disabled={typing}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex gap-2 px-4 pb-4">
              <label htmlFor={`${panelId}-input`} className="sr-only">
                {chatbot.inputLabel}
              </label>
              <input
                ref={inputRef}
                id={`${panelId}-input`}
                type="text"
                autoComplete="off"
                maxLength={300}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={chatbot.inputPlaceholder}
                className="flex-1 min-h-[48px] rounded-pill border hairline bg-navy px-4 text-light placeholder:text-light/60"
              />
              <button type="submit" className="btn btn-primary !px-4" aria-label={chatbot.send} disabled={typing || !input.trim()}>
                <Icon name="send" size={20} />
              </button>
            </form>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>,
    document.body,
  );
}

function Bubble({ from, text }: { from: 'bot' | 'user'; text: string }) {
  return (
    <p
      className={`max-w-[88%] px-4 py-3 rounded-lg2 text-[0.9375rem] leading-relaxed ${
        from === 'bot' ? 'bg-blush/10 text-light rounded-tl-md' : 'bg-pink text-navy justify-self-end rounded-tr-md'
      }`}
    >
      <span className="sr-only">{from === 'bot' ? chatbot.botPrefix : chatbot.userPrefix}</span>
      {text}
    </p>
  );
}
