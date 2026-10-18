import Link from 'next/link';
import { FiArrowLeft, FiDroplet, FiFeather, FiGrid } from 'react-icons/fi';

const reasons = [
  {
    icon: FiDroplet,
    title: 'طعم‌های متنوع',
    description: 'ترکیبات مختلف برای ذائقه و هدف تمرینی هر فرد.',
  },
  {
    icon: FiFeather,
    title: 'فرمول استاندارد',
    description: 'مواد اولیه و فرآیند تولید طبق استانداردهای مشخص.',
  },
  {
    icon: FiGrid,
    title: 'اطلاعات شفاف',
    description: 'ترکیبات و مقادیر هر محصول پیش از خرید در دسترس است.',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="about" className="border-border bg-surface-1 grid gap-8 rounded-lg border p-6 sm:p-10 lg:grid-cols-2">
      <div className="flex flex-col justify-center">
        <p className="text-muted text-sm font-bold">چرا ما را انتخاب کنید</p>
        <h2 className="text-foreground mt-2 text-2xl leading-tight font-black sm:text-3xl">
          چرا بهترین محصول ما را انتخاب کنید
        </h2>
        <p className="text-muted mt-4 max-w-lg text-sm leading-7">
          مکمل‌های فیت مکمل با بهترین مواد اولیه و استانداردهای دقیق تولید می‌شوند تا کیفیت و
          اثربخشی هر محصول را تضمین کنند. تیم ما در هر مرحله، از انتخاب مواد اولیه تا بسته‌بندی
          نهایی، بر کیفیت محصول نظارت می‌کند.
        </p>
        <Link
          href="/contact"
          className="bg-foreground mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-md px-5 text-sm font-bold text-white transition-colors hover:bg-black/80"
        >
          بیشتر بدانید
          <FiArrowLeft size={16} aria-hidden />
        </Link>
      </div>

      <ul className="space-y-4">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <li
              key={reason.title}
              className="border-border bg-card flex items-start gap-4 rounded-lg border p-4"
            >
              <span className="bg-accent/15 text-accent-strong grid h-11 w-11 shrink-0 place-items-center rounded-full">
                <Icon size={20} aria-hidden />
              </span>
              <div>
                <h3 className="text-foreground text-sm font-black">{reason.title}</h3>
                <p className="text-muted mt-1 text-xs leading-6">{reason.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
