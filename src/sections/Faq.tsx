import { useState } from 'react';
import { faq, sectionIds } from '../content';
import { openChat } from '../lib/events';
import { faqAnswer } from '../lib/faqText';
import { Icon } from '../components/Icon';
import { SectionTag } from '../components/Drawing';

/**
 * Two-pane index. Desktop: numbered questions on the left, the selected answer in the right
 * pane. Mobile: the same buttons expand their answer inline (accordion). Each button keeps
 * aria-expanded and aria-controls pointing at the panel that shows its answer.
 */
export function Faq() {
  const [active, setActive] = useState<string | null>(faq.items[0].id);
  const shown = faq.items.find((i) => i.id === active) ?? faq.items[0];
  const shownIndex = faq.items.indexOf(shown);

  return (
    <section id={sectionIds.faq} aria-labelledby="faq-title" className="section paper">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionTag id={sectionIds.faq} />
            <h2 id="faq-title" className="mt-4" data-reveal>
              {faq.heading}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 flex items-center gap-4" data-reveal>
            <p className="text-small text-muted">{faq.askText}</p>
            <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={openChat}>
              <Icon name="chat" size={16} />
              {faq.askCta}
            </button>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-12 border-t border-navy/30">
          <ol className="lg:col-span-6 lg:border-r border-navy/30" role="list">
            {faq.items.map((item, i) => {
              const isOpen = active === item.id;
              const buttonId = `faq-btn-${item.id}`;
              const panelId = `faq-panel-${item.id}`;
              return (
                <li key={item.id} className="border-b border-navy/20">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${panelId} faq-pane`}
                      onClick={() => setActive(isOpen && !window.matchMedia('(min-width: 1024px)').matches ? null : item.id)}
                      className={`w-full flex items-center gap-4 text-left py-4 pr-4 min-h-[60px] transition-colors ${isOpen ? 'lg:bg-navy lg:text-light lg:pl-4' : 'lg:pl-0 hover:text-navy'}`}
                    >
                      <span className={`mono text-[0.75rem] w-7 shrink-0 ${isOpen ? 'text-pink lg:text-blush' : ''}`} aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-[1.0625rem]">{item.question}</span>
                      <span aria-hidden="true" className={`ml-auto shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 lg:rotate-0' : ''}`}>
                        <Icon name="arrowRight" size={18} />
                      </span>
                    </button>
                  </h3>
                  {/* Mobile accordion panel */}
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="lg:hidden pb-5 pl-11 pr-2">
                    <p className="text-muted">{faqAnswer(item)}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Desktop answer pane */}
          <div
            id="faq-pane"
            role="region"
            aria-live="polite"
            aria-labelledby={`faq-btn-${shown.id}`}
            className="hidden lg:block lg:col-span-6 p-10 relative"
          >
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] card-light crop p-8">
              <p className="mono text-[0.75rem] uppercase tracking-[0.14em] flex items-center gap-3" aria-hidden="true">
                <span className="w-6 h-px bg-pink" />
                A{String(shownIndex + 1).padStart(2, '0')}
              </p>
              <p className="mt-4 display text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] text-navy">{shown.question}</p>
              <p className="mt-4 lead text-muted">{faqAnswer(shown)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
