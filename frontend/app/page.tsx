import ProductShowcase from "./components/ProductShowcase";
import SliderHero from "./components/SliderHero";
import { getProducts, getSliders } from "./lib/graphql";

export default async function Home() {
  const [products, sliders] = await Promise.all([getProducts(), getSliders()]);

  return (
    <main>
      <SliderHero slides={sliders} />

      <div className="mx-auto max-w-7xl space-y-14 px-5 py-12 sm:px-8 lg:px-12">
        <ProductShowcase products={products} />

        <section
          id="about"
          className="grid gap-6 border-y border-border py-8 xs:grid-cols-[0.8fr_1.2fr]"
        >
          <p className="text-md leading-8 text-muted text-center ">
            هدف فیت مکمل معرفی محصولات بدنسازی با زبان قابل فهم است تا کاربر
            بتواند قبل از خرید کاربرد ویگیها و تفاوت محصولات را بهتر بشناسد. این
            پروه برای توسعه فروشگاه بلاگ یا سیستم مقایسه محصول هم آماده است.
          </p>
        </section>
      </div>
    </main>
  );
}
