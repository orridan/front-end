import { describe, expect, it } from 'vitest';
import { chatbot, faq } from '../content';
import { answerById, matchQuestion, pricingAnswer, tokenize } from './chatMatcher';

describe('tokenize', () => {
  it('lowercases, strips punctuation and plurals', () => {
    expect(tokenize('What are the PLANS?')).toEqual(['what', 'are', 'the', 'plan']);
  });
});

describe('matchQuestion', () => {
  const cases: [string, string][] = [
    ['What is Orridan?', 'what-is-orridan'],
    ['does it connect to live IoT sensors', 'live-data'],
    ['Does it use live data?', 'live-data'],
    ['can it render 3D models', 'render-simulate'],
    ['how much does it cost per month', 'pricing'],
    ['how are config versions handled', 'track-config'],
    ['how do I compare scenario results', 'compare-results'],
    ['how do I log in to my account', 'sign-in'],
    ['I want to talk to a human', 'contact'],
    ['how long is setup and delivery', 'delivery'],
  ];
  it.each(cases)('"%s" matches %s', (input, id) => {
    const result = matchQuestion(input);
    expect(result.kind).toBe('answer');
    if (result.kind === 'answer') expect(result.id).toBe(id);
  });

  it('falls back when it cannot answer', () => {
    for (const input of ['', '   ', 'banana smoothie recipe', 'zzzz']) {
      const result = matchQuestion(input);
      expect(result.kind).toBe('fallback');
      expect(result.action).toBe('contact');
      expect(result.answer).toBe(chatbot.fallback);
    }
  });

  it('answers every FAQ question asked verbatim with its own entry', () => {
    for (const item of faq.items) {
      const result = matchQuestion(item.question);
      expect(result.kind === 'answer' && result.id).toBe(item.id);
    }
  });

  it('never claims live data', () => {
    const r = matchQuestion('is the data real-time?');
    expect(r.kind === 'answer' && r.answer.startsWith('No.')).toBe(true);
  });
});

describe('answerById', () => {
  it('resolves every quick reply chip', () => {
    for (const chip of chatbot.quickReplies) {
      const r = answerById(chip.intent);
      expect(r.kind).toBe('answer');
      expect(r.answer.length).toBeGreaterThan(10);
    }
  });

  it('points sign-in questions to the product page, never straight to the dashboard', () => {
    for (const id of ['sign-in', 'get-started']) {
      const r = answerById(id);
      expect(r.kind === 'answer' && r.action).toBe('product');
      expect(r.answer).toContain('Product page');
    }
  });

  it('builds the pricing answer from getPrice', () => {
    expect(pricingAnswer()).toContain('$50 / month');
    expect(pricingAnswer()).toContain('$150 / month');
    expect(pricingAnswer()).not.toContain('per year');
  });
});
