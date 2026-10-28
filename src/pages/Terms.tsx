import { seo, termsPage } from '../content';
import { LegalLayout } from '../components/LegalLayout';

export default function Terms() {
  return <LegalLayout seo={seo.terms} heading={termsPage.heading} intro={termsPage.intro} sections={termsPage.sections} />;
}
