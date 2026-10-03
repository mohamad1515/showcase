import ProductShowcase from './components/ProductShowcase';
import SliderHero from './components/SliderHero';
import { getCategories, getProducts, getSliders } from './lib/graphql';
import CategoriesSection from './components/CategoriesSection';
import OfferProducts from './components/OfferProducts';
import NewsProducts from './components/NewsProducts';
import OfferBanner from './components/OfferBanner';
import HomeTrustStrip from './components/HomeTrustStrip';
import HomeEditorial from './components/HomeEditorial';
import HomeArticles from './components/HomeArticles';
import HomeTestimonials from './components/HomeTestimonials';
import { getProductReviews } from './lib/graphql';

export default async function Home() {
  const [products, sliders, categories] = await Promise.all([
    getProducts(),
    getSliders(),
    getCategories(),
  ]);
  const reviewProducts = products.filter((product) => product.reviewCount > 0).slice(0, 3);
  const reviewResults = await Promise.allSettled(
    reviewProducts.map((product) => getProductReviews(product.slug)),
  );
  const reviews = reviewResults.flatMap((result) =>
    result.status === 'fulfilled' ? result.value.comments : [],
  );

  return (
    <div>
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-6 sm:px-5 lg:px-6">
        <SliderHero slides={sliders} />
      </div>

      <div className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:space-y-14 sm:px-5 sm:py-12 lg:space-y-[72px] lg:px-6">
        <OfferProducts />

        <CategoriesSection categories={categories} />

        <ProductShowcase products={products} />

        <NewsProducts products={products} />
      </div>

      <HomeTrustStrip />

      <div className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:space-y-14 sm:px-5 sm:py-12 lg:space-y-[72px] lg:px-6">
        <HomeTestimonials reviews={reviews} />
        <HomeEditorial />
        <OfferBanner />
        <HomeArticles />
      </div>
    </div>
  );
}
