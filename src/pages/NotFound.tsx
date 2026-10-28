import { Link } from 'react-router';
import { notFound, routes, seo } from '../content';
import { Seo } from '../components/Seo';
import { PageHeader } from '../components/PageHeader';
import { Icon } from '../components/Icon';

export default function NotFound() {
  return (
    <>
      <Seo entry={seo.notFound} />
      <PageHeader eyebrow={notFound.eyebrow} title={notFound.heading}>
        <p className="lead text-muted">{notFound.text}</p>
        <div className="mt-8">
          <Link to={routes.home} className="btn btn-primary shimmer">
            <Icon name="arrowLeft" size={18} />
            {notFound.homeCta}
          </Link>
        </div>
      </PageHeader>
    </>
  );
}
