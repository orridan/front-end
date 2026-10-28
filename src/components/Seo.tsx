import { useEffect } from 'react';
import type { SeoEntry } from '../content';
import { headFor } from '../lib/seoHead';

/**
 * Per-route head management. Removes every tag it owns (data-seo) and writes the new set,
 * so there is always exactly one canonical, description and robots tag.
 */
export function Seo({ entry }: { entry: SeoEntry }) {
  useEffect(() => {
    const { title, tags } = headFor(entry);
    document.title = title;
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
    // Also drop any stray canonical that did not come from us.
    document.head.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    const fragment = document.createDocumentFragment();
    for (const t of tags) {
      const el = document.createElement(t.tag);
      el.setAttribute('data-seo', '');
      for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
      fragment.appendChild(el);
    }
    const anchor = document.head.querySelector('meta[name="color-scheme"]');
    if (anchor?.nextSibling) document.head.insertBefore(fragment, anchor.nextSibling);
    else document.head.appendChild(fragment);
  }, [entry]);
  return null;
}
