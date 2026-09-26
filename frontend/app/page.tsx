import Image from 'next/image';
import ProductShowcase from './components/ProductShowcase';
import SliderHero from './components/SliderHero';
import { getProducts, getSliders } from './lib/graphql';
import firstSlide from '@/public/images/slider/sideA.png';
import secondSlide from '@/public/images/slider/sideB.png';
import CategoriesSection from './components/CategoriesSection';
import OfferProducts from './components/OfferProducts';
import NewsProducts from './components/NewsProducts';
import OfferBanner from './components/OfferBanner';
import { FiChevronLeft } from 'react-icons/fi';

const supplementList = [
  { title: 'مکمل‌های پروتئینی', hasArrow: true },
  { title: 'کراتین', hasArrow: true },
  { title: 'پری ورک اوت', hasArrow: true },
  { title: 'کربوهیدرات‌ها', hasArrow: false },
  { title: 'اسیدهای آمینه', hasArrow: true },
  { title: 'انرژی و تمرکز', hasArrow: false },
  { title: 'مکمل‌های حجمی', hasArrow: false },
  { title: 'کاهش وزن', hasArrow: false },
  { title: 'فیتنس آقایان', hasArrow: false },
];

export default async function Home() {
  const [products, sliders] = await Promise.all([getProducts(), getSliders()]);

  return (
    <main>
      <div className="mx-auto mt-5 flex max-w-full sm:px-8 lg:px-12">
        {/* supplementList */}
        <div className="hidden w-[300px] flex-shrink-0 lg:block">
          <div className="border-border relative h-full overflow-visible rounded-xl border bg-white p-5">
            <div className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 -rotate-45 border border-b-0 border-l-0 bg-white" />

            <ul className="space-y-1">
              {supplementList.map((item) => (
                <li
                  key={item.title}
                  className="text-foreground hover:bg-muted/10 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-normal transition-colors"
                >
                  <span>{item.title}</span>
                  {item.hasArrow && <FiChevronLeft size={16} className="text-muted" />}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slider */}
        <div className="hidden min-w-0 flex-1 lg:block">
          <SliderHero slides={sliders} />
        </div>

        {/* two side */}
        <div className="hidden w-72 flex-shrink-0 flex-col gap-2 lg:flex">
          {/* Side A */}
          <div className="border-border bg-surface relative min-h-0 flex-1 overflow-hidden rounded-xl border">
            <Image
              src={firstSlide}
              alt="تصویر مکمل بدنسازی"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>

          {/* Side B */}
          <div className="border-border bg-surface relative min-h-0 flex-1 overflow-hidden rounded-xl border">
            <Image
              src={secondSlide}
              alt="تصویر مکمل بدنسازی"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto space-y-14 px-5 py-12 sm:px-8 lg:px-12">
        <CategoriesSection />

        <OfferProducts />

        <NewsProducts products={products} />

        <OfferBanner />

        <ProductShowcase products={products} />
        <section
          id="about"
          className="xs:grid-cols-[0.8fr_1.2fr] border-border grid gap-6 border-y py-8"
        >
          <p className="text-md text-muted text-center leading-8">
            هدف فیت مکمل معرفی محصولات بدنسازی با زبان قابل فهم است تا کاربر بتواند قبل از خرید
            کاربرد ویژگی‌ها و تفاوت محصولات را بهتر بشناسد. این پروژه برای توسعه فروشگاه، بلاگ یا
            سیستم مقایسه محصول هم آماده است.
          </p>
        </section>
      </div>
    </main>
  );
}
