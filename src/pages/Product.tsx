import { seo } from '../content';
import { Seo } from '../components/Seo';
import { ProductShowcase } from '../sections/ProductShowcase';

export default function Product() {
  return (
    <>
      <Seo entry={seo.product} />
      <ProductShowcase />
    </>
  );
}
