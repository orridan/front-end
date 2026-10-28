import { ExternalLink } from '../components/Links';
import { Icon } from '../components/Icon';
import { DrawingStrip, Guides } from '../components/Drawing';
import { drawing, productPage, site } from '../content';
import './ProductShowcase.css';

function SectionHeading({ id, index, label, title, intro }: { id: string; index: string; label: string; title: string; intro: string }) {
  return (
    <header className="product-section-heading">
      <p className="section-tag"><span aria-hidden="true" className="product-heading-rule" />{index} / {label}</p>
      <h2 id={id} className="mt-4">{title}</h2>
      <p className="product-section-intro">{intro}</p>
    </header>
  );
}

function HeroRecordVisual() {
  return (
    <div className="product-hero-visual" role="img" aria-label={productPage.visualDescription}>
      <div className="product-visual-topline" aria-hidden="true">
        <span>{productPage.visualLabel}</span>
        <span>RECORD RELATIONSHIPS</span>
      </div>
      <div className="product-record-flow" aria-hidden="true">
        {productPage.visualRecords.map((record, index) => (
          <div className="product-record-step" key={record.label}>
            <div className="product-record-node">
              <span className="product-record-mark">0{index + 1}</span>
              <strong>{record.label}</strong>
              <span>{record.detail}</span>
            </div>
            {index < productPage.visualRecords.length - 1 ? <span className="product-record-connector"><i /></span> : null}
          </div>
        ))}
      </div>
      <div className="product-visual-bottom">
        <div className="product-history-panel">
          <span className="product-visual-label">{productPage.visualHistory}</span>
          <div className="product-history-line"><i /><i /><i /><i /></div>
          <div className="product-history-captions"><span>Recorded</span><span>Historical</span><span>Reviewable</span></div>
        </div>
        <div className="product-comparison-panel">
          <span className="product-visual-label">{productPage.visualComparison}</span>
          <div className="product-compare-row"><span>Expected</span><i /><b /></div>
          <div className="product-compare-row"><span>Recorded</span><i /><b /></div>
        </div>
      </div>
      <p className="product-visual-note">{productPage.visualNote}</p>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <div className="product-page">
      <section className="product-hero drawing atmosphere" aria-labelledby="product-title">
        <Guides />
        <div className="container-site product-hero-inner">
          <DrawingStrip items={drawing.headerStrip} className="product-hero-strip" />
          <div className="product-hero-copy">
            <p className="section-tag"><span aria-hidden="true" className="product-heading-rule" />{productPage.eyebrow}</p>
            <h1 id="product-title">{productPage.heading}</h1>
            <p className="lead text-muted product-hero-lead">{productPage.line}</p>
            <div className="product-hero-actions">
              <ExternalLink href={site.dashboardUrl} className="btn btn-primary shimmer" data-testid="product-dashboard">
                {productPage.dashboardCta}<Icon name="arrowRight" size={18} />
              </ExternalLink>
              <a href="#technology-foundation" className="btn btn-ghost" data-testid="product-tech-cta">
                {productPage.technologyCta}<Icon name="arrowRight" size={18} />
              </a>
            </div>
          </div>
          <HeroRecordVisual />
          <DrawingStrip items={drawing.headerStrip} className="product-hero-strip product-hero-strip-bottom" />
        </div>
      </section>

      <section className="product-section surface-light paper" aria-labelledby="application-foundation-title">
        <div className="container-site">
          <SectionHeading id="application-foundation-title" index="01" label={productPage.foundation.eyebrow} title={productPage.foundation.heading} intro={productPage.foundation.intro} />
          <dl className="product-foundation-grid">
            {productPage.foundation.items.map((item) => (
              <div className="product-foundation-item" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="product-foundation-note"><Icon name="info" size={18} />{productPage.foundation.note}</p>
        </div>
      </section>

      <section id="technology-foundation" className="product-section drawing atmosphere" aria-labelledby="technology-foundation-title">
        <Guides labels={false} />
        <div className="container-site relative">
          <SectionHeading id="technology-foundation-title" index="02" label={productPage.technology.eyebrow} title={productPage.technology.heading} intro={productPage.technology.intro} />
          <div className="product-technology-grid">
            {productPage.technology.items.map((technology, index) => (
              <article className="product-technology-card" key={technology.name}>
                <div className="product-card-meta"><span>0{index + 1} / {productPage.technology.futureMeta}</span><span className="product-status product-status-proposed">{productPage.technology.proposedLabel}</span></div>
                <h3>{technology.name}</h3>
                <p>{technology.description}</p>
              </article>
            ))}
          </div>
          <article className="product-current-foundation">
            <div className="product-current-heading">
              <div>
                <span className="product-status product-status-current">{productPage.technology.currentLabel}</span>
                <h3>{productPage.technology.applicationTitle}</h3>
              </div>
              <span className="product-card-index">{productPage.technology.currentIndex}</span>
            </div>
            <dl className="product-current-items">
              {productPage.technology.foundationItems.map((item) => (
                <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
              ))}
            </dl>
          </article>
        </div>
      </section>

      <section id="technical-architecture" className="product-section product-architecture" aria-labelledby="technical-architecture-title">
        <div className="container-site">
          <SectionHeading id="technical-architecture-title" index="03" label={productPage.architecture.eyebrow} title={productPage.architecture.heading} intro={productPage.architecture.intro} />
          <ol className="product-architecture-flow">
            {productPage.architecture.stages.map((stage, index) => (
              <li className="product-architecture-stage" key={stage.title}>
                <span className="product-architecture-index">0{index + 1}</span>
                <span className="product-architecture-icon"><Icon name={stage.icon} size={22} /></span>
                <div><h3>{stage.title}</h3><p>{stage.detail}</p></div>
              </li>
            ))}
          </ol>
          <div className="product-future-boundary">
            <div className="product-future-heading">
              <div>
                <p className="section-tag">{productPage.architecture.boundaryLabel}</p>
                <h3>{productPage.architecture.futureHeading}</h3>
                <p>{productPage.architecture.futureIntro}</p>
              </div>
              <span className="product-status product-status-proposed">{productPage.technology.proposedOnlyLabel}</span>
            </div>
            <ul className="product-future-options">
              {productPage.architecture.futureItems.map((item) => (
                <li key={item.title}><h4>{item.title}</h4><p>{item.detail}</p></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="application-capabilities" className="product-section product-capabilities surface-light paper" aria-labelledby="application-capabilities-title">
        <div className="container-site">
          <SectionHeading id="application-capabilities-title" index="04" label={productPage.capabilities.eyebrow} title={productPage.capabilities.heading} intro={productPage.capabilities.intro} />
          <div className="product-capability-grid">
            {productPage.capabilities.items.map((capability, index) => (
              <article className="product-capability-card" key={capability.title}>
                <div className="product-capability-top"><Icon name={capability.icon} size={25} /><span>0{index + 1}</span></div>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
                <ul>{capability.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="engineering-governance" className="product-section product-governance" aria-labelledby="engineering-governance-title">
        <Guides labels={false} />
        <div className="container-site relative">
          <SectionHeading id="engineering-governance-title" index="05" label={productPage.governance.eyebrow} title={productPage.governance.heading} intro={productPage.governance.intro} />
          <div className="product-governance-grid">
            {productPage.governance.items.map((item, index) => (
              <article className="product-governance-item" key={item.title}>
                <span className="product-governance-index">0{index + 1}</span>
                <div><h3>{item.title}</h3><p>{item.detail}</p></div>
                <span className="product-governance-status">{item.status}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="technology-roadmap" className="product-section product-roadmap drawing atmosphere" aria-labelledby="technology-roadmap-title">
        <Guides labels={false} />
        <div className="container-site relative">
          <SectionHeading id="technology-roadmap-title" index="06" label={productPage.roadmap.eyebrow} title={productPage.roadmap.heading} intro={productPage.roadmap.intro} />
          <ol className="product-roadmap-grid">
            {productPage.roadmap.items.map((item, index) => (
              <li className="product-roadmap-card" key={item.title}>
                <div className="product-roadmap-card-meta"><span className="product-roadmap-number">{String(index + 1).padStart(2, '0')}</span><span className="product-status product-status-planned">{productPage.roadmap.statusLabel}</span></div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
          <p className="product-roadmap-note">{productPage.roadmap.note}</p>
        </div>
      </section>
    </div>
  );
}