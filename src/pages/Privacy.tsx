import { privacyPage, seo } from '../content';
import { LegalLayout } from '../components/LegalLayout';

export default function Privacy() {
  return <LegalLayout seo={seo.privacy} heading={privacyPage.heading} intro={privacyPage.intro} sections={privacyPage.sections} updated={privacyPage.updated} draft={false} companyContact={false} />;
}
