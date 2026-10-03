import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function HomeEditorial() {
  return (
    <section
      id="about"
      className="bg-surface-1 grid overflow-hidden rounded-lg md:grid-cols-2"
      dir="rtl"
    >
      <div className="relative min-h-64 bg-white sm:min-h-80">
        <Image
          src="/images/products/img-6.png"
          alt="ظرف مکمل پروتئین وی"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-8 sm:p-12"
        />
      </div>
      <div className="flex flex-col items-start justify-center px-6 py-8 sm:px-10 sm:py-12">
        <p className="text-muted text-sm font-bold">انتخاب آگاهانه‌تر</p>
        <h2 className="text-foreground mt-3 text-2xl leading-tight font-black sm:text-3xl">
          پیش از خرید، جزئیات محصول را بررسی کن
        </h2>
        <p className="text-muted mt-4 max-w-lg text-sm leading-7">
          ویژگی‌ها، توضیحات، ترکیبات و موجودی محصولات را در صفحهٔ هر محصول ببین و بعد انتخاب کن.
        </p>
        <Link
          href="/products"
          className="bg-foreground mt-6 inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          دیدن محصولات
          <FiArrowLeft size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
