import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { homePromotions } from '../data/promotions';

const OfferProducts = () => {
  return (
    <section id="offer" className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {homePromotions.map((item) => (
          <article
            key={item.id}
            className="group relative isolate h-56 overflow-hidden rounded-lg sm:h-64"
          >
            <Image
              src={item.background}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/45 to-transparent" />

            <div
              className="relative z-10 flex h-full items-center justify-between px-5 sm:px-7"
              dir="rtl"
            >
              <div className="flex w-[58%] flex-col items-start gap-3 text-white">
                <h2 className="text-2xl font-black sm:text-3xl">{item.title}</h2>
                <p className="text-sm leading-6 text-white/80">{item.description}</p>
                <Link
                  href="/products"
                  className="bg-accent text-foreground hover:bg-accent-strong inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-bold transition-colors"
                >
                  مشاهده محصولات
                  <FiArrowLeft size={16} aria-hidden />
                </Link>
              </div>

              <div className="relative h-full w-[42%]">
                <Image
                  src={item.productImage}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 22vw, 42vw"
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OfferProducts;
