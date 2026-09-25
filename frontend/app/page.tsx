import Image from 'next/image';
import ProductShowcase from './components/ProductShowcase';
import SliderHero from './components/SliderHero';
import { getProducts, getSliders } from './lib/graphql';
import firstSlide from '@/public/images/slider/sideA.png';
import secondSlide from '@/public/images/slider/sideB.png';

const supplementList = [
  'پروتئین وی',
  'گینر',
  'کراتین',
  'BCAA',
  'گلوتامین',
  'پری‌ورک‌اوت',
  'بتاآلانین',
  'مولتی‌ویتامین',
  'امگا ۳',
  'پروتئین کازئین',
];

export default async function Home() {
  const [products, sliders] = await Promise.all([getProducts(), getSliders()]);

  return (
    <main>
      <div className="mx-auto mt-2 flex max-w-full sm:px-8 lg:px-12">
        {/* A - لیست محصولات */}
        <div className="hidden w-[300px] flex-shrink-0 lg:block">
          <div className="border-border h-full rounded-xl border p-5">
            <div className="space-y-2">
              {supplementList.map((supplement, index) => (
                <div
                  key={supplement}
                  className="text-foreground hover:bg-muted/10 flex cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-sm font-normal transition-colors"
                >
                  <span>{supplement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="hidden min-w-0 flex-1 lg:block">
          <SliderHero slides={sliders} />
        </div>

        {/* B + C */}
        <div className="hidden w-72 flex-shrink-0 flex-col gap-2 lg:flex">
          {/* B */}
          <div className="border-border bg-surface relative min-h-0 flex-1 overflow-hidden rounded-xl border">
            <Image
              src={firstSlide}
              alt="تصویر مکمل بدنسازی"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>

          {/* C */}
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

      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-8 lg:px-12">
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
