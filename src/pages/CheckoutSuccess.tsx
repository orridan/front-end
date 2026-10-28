import { Link } from 'react-router';
import { checkoutSuccess, routes, seo } from '../content';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { Icon } from '../components/Icon';

/** The dashboard is only linked from the product page, so the second button leads there. */
export default function CheckoutSuccess() {
  return (
    <>
      <Seo entry={seo.checkoutSuccess} />
      <PageHeader eyebrow={checkoutSuccess.eyebrow} title={checkoutSuccess.heading}>
        <p className="lead text-muted" data-testid="checkout-message">
          {checkoutSuccess.text}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={routes.home} className="btn btn-primary shimmer">
            <Icon name="arrowLeft" size={18} />
            {checkoutSuccess.homeCta}
          </Link>
          <Link to={checkoutSuccess.productTo} className="btn btn-ghost">
            {checkoutSuccess.productCta}
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </PageHeader>
    </>
  );
}
