import { Suspense } from 'react';
import { seo } from '../content';
import { Seo } from '../components/Seo';
import { Hero } from '../sections/Hero';
// Everything below the hero ships as one chunk, so hash targets appear together.
import { BelowFold } from '../lazyRoutes';

export default function Home() {
  return (
    <>
      <Seo entry={seo.home} />
      <Hero />
      <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-hidden="true" />}>
        <BelowFold />
      </Suspense>
    </>
  );
}
