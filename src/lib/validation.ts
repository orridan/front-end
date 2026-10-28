import { contact } from '../content';
import { fill, isValidEmail } from './placeholder';

export type ContactValues = { name: string; email: string; company: string; subject: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const f = contact.fields;
const e = contact.errors;

export function validateField(field: keyof ContactValues, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case 'name':
      if (!value) return e.required;
      if (value.length < f.name.min) return fill(e.tooShort, { min: f.name.min });
      if (value.length > f.name.max) return fill(e.tooLong, { max: f.name.max });
      return undefined;
    case 'email':
      if (!value) return e.required;
      if (value.length > f.email.max || !isValidEmail(value)) return e.email;
      return undefined;
    case 'company':
      if (value.length > f.company.max) return fill(e.tooLong, { max: f.company.max });
      return undefined;
    case 'subject':
      if (!contact.subjects.includes(value)) return e.subject;
      return undefined;
    case 'message':
      if (!value) return e.required;
      if (value.length < f.message.min) return fill(e.tooShort, { min: f.message.min });
      if (value.length > f.message.max) return fill(e.tooLong, { max: f.message.max });
      return undefined;
  }
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  (Object.keys(values) as (keyof ContactValues)[]).forEach((key) => {
    const message = validateField(key, values[key]);
    if (message) errors[key] = message;
  });
  return errors;
}
