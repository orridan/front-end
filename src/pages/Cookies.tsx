import { cookieConsent, cookiesPage, seo } from '../content';
import { LegalLayout } from '../components/LegalLayout';
import { consentStore } from '../lib/consent';
import { Icon } from '../components/Icon';

const sections = [
  { id: 'categories', heading: cookiesPage.categoriesHeading },
  { id: 'storage-list', heading: cookiesPage.tableCaption },
];

export default function Cookies() {
  return (
    <LegalLayout seo={seo.cookies} heading={cookiesPage.heading} intro={cookiesPage.intro} sections={[]} extraToc={sections}>
      <section id={sections[0].id} aria-labelledby="categories-h">
        <h2 id="categories-h">{sections[0].heading}</h2>
        <div className="grid gap-3 mt-4">
          {cookieConsent.categories.map((cat) => (
            <div key={cat.id} className="glass !rounded-lg2 p-5">
              <h3 className="font-display text-[1.0625rem] font-semibold flex items-center gap-2">
                {cat.title}
                {cat.locked ? <span className="eyebrow !text-[0.75rem]">{cookieConsent.alwaysOn}</span> : null}
              </h3>
              <p className="mt-1 text-light/90">{cat.text}</p>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-primary mt-6" onClick={() => consentStore.openPreferences()}>
          <Icon name="shield" size={18} />
          {cookiesPage.openPreferences}
        </button>
      </section>
      <section id={sections[1].id} aria-labelledby="storage-h">
        <h2 id="storage-h">{cookiesPage.tableCaption}</h2>
        <div className="mt-4 overflow-x-auto rounded-lg2 border hairline" role="region" aria-labelledby="storage-h" tabIndex={0}>
          <table className="w-full min-w-[36rem] text-left text-small">
            <caption className="sr-only">{cookiesPage.tableCaption}</caption>
            <thead className="bg-blush/5">
              <tr>
                <th scope="col" className="p-3 font-semibold">{cookiesPage.tableHeaders.name}</th>
                <th scope="col" className="p-3 font-semibold">{cookiesPage.tableHeaders.category}</th>
                <th scope="col" className="p-3 font-semibold">{cookiesPage.tableHeaders.purpose}</th>
                <th scope="col" className="p-3 font-semibold">{cookiesPage.tableHeaders.duration}</th>
              </tr>
            </thead>
            <tbody>
              {cookiesPage.items.map((item) => (
                <tr key={item.name} className="border-t hairline align-top">
                  <th scope="row" className="p-3 font-mono font-medium text-blush">{item.name}</th>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 text-light/90">{item.purpose}</td>
                  <td className="p-3 text-light/90">{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LegalLayout>
  );
}
