import { useRef } from 'react';
import { countUp, measureLines, revealChildren, useGsap } from '../lib/gsapMotion';
import { About } from './About';
import { HowItWorks } from './HowItWorks';
import { Features } from './Features';
import { Pricing } from './Pricing';
import { Faq } from './Faq';
import { Contact } from './Contact';
import { ClosingBanner } from './ClosingBanner';

/** All landing page sections below the hero, shipped as one lazy chunk. */
export default function BelowFold() {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(ref, (root) => {
    revealChildren(root);
    countUp(root);
    measureLines(root);
  });
  return (
    <div ref={ref}>
      <About />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <Contact />
      <ClosingBanner />
    </div>
  );
}
