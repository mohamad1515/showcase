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
import Features from './components/Features';
import WhyChooseUs from './components/WhyChooseUs';
import GalleryFilter from './components/GalleryFilter';
import StatsCounters from './components/StatsCounters';
import FaqSection from './components/FaqSection';
import PricingSection from './components/PricingSection';
import FeaturedProduct from './components/FeaturedProduct';
import CtaBanner from './components/CtaBanner';

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
    <div className="relative overflow-x-clip">
      {/* Decorative, blurred color fields — purely visual backdrop for the
          glass panels below; never affects layout or interaction. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-accent/25 absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full blur-3xl" />
        <div className="bg-gold/15 absolute -top-10 -left-28 h-[260px] w-[260px] rounded-full blur-2xl" />
        <div className="bg-accent/18 absolute top-[20%] -right-20 h-[320px] w-[320px] rounded-full blur-3xl" />
        <div className="bg-gold/22 absolute top-[34%] left-[6%] h-[240px] w-[240px] rounded-full blur-2xl" />
        <div className="bg-gold/20 absolute top-[55%] -left-32 h-[380px] w-[380px] rounded-full blur-3xl" />
        <div className="bg-accent/20 absolute top-[68%] -right-24 h-[300px] w-[300px] rounded-full blur-3xl" />
        <div className="bg-accent/15 absolute top-[85%] right-[10%] h-[320px] w-[320px] rounded-full blur-3xl" />
        <div className="bg-gold/18 absolute top-[96%] -left-20 h-[260px] w-[260px] rounded-full blur-2xl" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-4 pt-6 sm:px-5 lg:px-6">
        <SliderHero slides={sliders} />
      </div>

      <div className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:space-y-14 sm:px-5 sm:py-12 lg:space-y-[72px] lg:px-6">
        <OfferProducts />

        <Features />

        <CategoriesSection categories={categories} />

        <WhyChooseUs />

        <ProductShowcase products={products} />

        <GalleryFilter products={products} categories={categories} />

        <NewsProducts products={products} />
      </div>

      <HomeTrustStrip />

      <div className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-10 sm:space-y-14 sm:px-5 sm:py-12 lg:space-y-[72px] lg:px-6">
        <StatsCounters />
        <HomeTestimonials reviews={reviews} />
        <FaqSection />
        <PricingSection />
        <FeaturedProduct product={products.find((product) => product.stock > 0) ?? products[0]} />
        <HomeEditorial />
        <OfferBanner />
        <CtaBanner />
        <HomeArticles />
      </div>
    </div>
  );
}
