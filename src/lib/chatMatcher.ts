/**
 * Rule-based answer matcher for the site assistant. Scores each known entry by keyword
 * overlap with the user's message. Pure and deterministic so it can be unit tested.
 */
import { chatbot, faq, pricing, type FaqItem } from '../content';
import { faqAnswer } from './faqText';
import { getPrice } from './pricing';

export type ChatAction = 'contact' | 'pricing' | 'product';

export type MatchResult =
  | { kind: 'answer'; id: string; answer: string; score: number; action?: ChatAction }
  | { kind: 'fallback'; answer: string; action: 'contact' };

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'i', 'it', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with', 'my', 'me',
  'you', 'your', 'can', 'be', 'this', 'that', 'how', 'does', 'what', 'there', 'any', 'we', 'our', 'please', 'hi', 'hello',
]);

/** Minimum score for a confident answer. One strong keyword is enough. */
export const MIN_SCORE = 2;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .map(stem)
    .filter((t) => t.length > 0);
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function pricingAnswer(): string {
  const parts = pricing.plans.map((plan) => {
    const m = getPrice(plan.id, 'monthly');
    const a = getPrice(plan.id, 'annual');
    if (m.kind === 'custom' || a.kind === 'custom') return `${plan.name}: ${pricing.customPrice.toLowerCase()}`;
    return `${plan.name}: ${m.perMonthLabel} ${pricing.perMonth}, billed monthly`;
  });
  return `Plans are priced in ${pricing.currency}. ${parts.join('. ')}.`;
}

export function knowledgeBase(): FaqItem[] {
  return [...faq.items, ...chatbot.facts].map((item) => (item.id === 'pricing' ? { ...item, answer: pricingAnswer() } : { ...item, answer: faqAnswer(item) }));
}

function actionFor(id: string): ChatAction | undefined {
  // The dashboard is only linked from the product page, so sign-in answers point there.
  if (id === 'sign-in' || id === 'get-started') return 'product';
  if (id === 'contact') return 'contact';
  if (id === 'pricing') return 'pricing';
  return undefined;
}

export function scoreEntry(tokens: string[], entry: FaqItem): number {
  const keywords = new Set(entry.keywords.map((k) => stem(k.toLowerCase())));
  const questionTokens = new Set(tokenize(entry.question).filter((t) => !STOP_WORDS.has(t)));
  let score = 0;
  for (const t of tokens) {
    if (STOP_WORDS.has(t)) continue;
    if (keywords.has(t)) score += 2;
    else if (questionTokens.has(t)) score += 1;
  }
  return score;
}

export function answerById(id: string): MatchResult {
  const entry = knowledgeBase().find((e) => e.id === id);
  if (!entry) return fallback();
  return { kind: 'answer', id: entry.id, answer: entry.answer, score: Infinity, action: actionFor(entry.id) };
}

export function fallback(): MatchResult {
  return { kind: 'fallback', answer: chatbot.fallback, action: 'contact' };
}

export function matchQuestion(input: string): MatchResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) return fallback();
  let best: { entry: FaqItem; score: number } | null = null;
  for (const entry of knowledgeBase()) {
    const score = scoreEntry(tokens, entry);
    if (!best || score > best.score) best = { entry, score };
  }
  if (!best || best.score < MIN_SCORE) return fallback();
  return { kind: 'answer', id: best.entry.id, answer: best.entry.answer, score: best.score, action: actionFor(best.entry.id) };
}
