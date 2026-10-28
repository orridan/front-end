import { Link } from 'react-router';
import { productPage, routes, seo, site } from '../content';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { ExternalLink } from '../components/Links';
import { Icon } from '../components/Icon';
import { ProductContentSlot } from '../components/ProductContentSlot';

export default function Product() {
  return (
    <>
      <Seo entry={seo.product} />
      <PageHeader eyebrow={productPage.eyebrow} title={productPage.heading}>
        <p className="lead text-muted">{productPage.line}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ExternalLink href={site.dashboardUrl} className="btn btn-primary shimmer" data-testid="product-dashboard">
            {productPage.dashboardCta}
            <Icon name="external" size={18} />
          </ExternalLink>
          <Link to={routes.home} className="btn btn-ghost" data-testid="product-home">
            <Icon name="arrowLeft" size={18} />
            {productPage.homeCta}
          </Link>
        </div>
      </PageHeader>
      <ProductContentSlot />
    </>
  );
}
