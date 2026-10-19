'use client';

import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import Tabs from './ui/Tabs';

type Plan = {
  name: string;
  tagline: string;
  price: string;
  billedFor: string;
  features: string[];
  bestValue?: boolean;
};

const periods: { id: string; label: string; plans: Plan[] }[] = [
  {
    id: 'monthly',
    label: 'ماهانه',
    plans: [
      {
        name: 'شروع',
        tagline: 'مناسب خرید آزمایشی',
        price: '۳۹۰,۰۰۰',
        billedFor: 'یک وعدهٔ ماهانه',
        features: ['یک محصول پروتئینی', 'راهنمای مصرف', 'پشتیبانی پیامکی'],
      },
      {
        name: 'استاندارد',
        tagline: 'محبوب‌ترین انتخاب',
        price: '۷۹۰,۰۰۰',
        billedFor: 'بسته ماهانه',
        features: ['دو محصول پروتئینی', 'ارسال رایگان', 'پشتیبانی اختصاصی', 'تخفیف خرید بعدی'],
        bestValue: true,
      },
      {
        name: 'پیشرفته',
        tagline: 'برای تمرین حرفه‌ای',
        price: '۱,۲۹۰,۰۰۰',
        billedFor: 'بسته کامل ماهانه',
        features: ['سه محصول منتخب', 'مشاورهٔ تغذیه', 'ارسال رایگان و فوری'],
      },
    ],
  },
  {
    id: 'yearly',
    label: 'سالانه',
    plans: [
      {
        name: 'شروع',
        tagline: 'مناسب خرید آزمایشی',
        price: '۳,۹۰۰,۰۰۰',
        billedFor: 'صورتحساب سالانه',
        features: ['یک محصول پروتئینی', 'راهنمای مصرف', 'پشتیبانی پیامکی'],
      },
      {
        name: 'استاندارد',
        tagline: 'محبوب‌ترین انتخاب',
        price: '۷,۹۰۰,۰۰۰',
        billedFor: 'صورتحساب سالانه',
        features: ['دو محصول پروتئینی', 'ارسال رایگان', 'پشتیبانی اختصاصی', 'تخفیف خرید بعدی'],
        bestValue: true,
      },
      {
        name: 'پیشرفته',
        tagline: 'برای تمرین حرفه‌ای',
        price: '۱۲,۹۰۰,۰۰۰',
        billedFor: 'صورتحساب سالانه',
        features: ['سه محصول منتخب', 'مشاورهٔ تغذیه', 'ارسال رایگان و فوری'],
      },
    ],
  },
];

function PricingBox({ plan }: { plan: Plan }) {
  return (
    <div
      className={
        plan.bestValue
          ? 'glass ring-accent-strong relative flex flex-col rounded-lg p-6 ring-2'
          : 'glass relative flex flex-col rounded-lg p-6'
      }
    >
      {plan.bestValue && (
        <span className="bg-accent absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-black text-black">
          بهترین ارزش
        </span>
      )}
      <h3 className="text-foreground text-lg font-black">{plan.name}</h3>
      <p className="text-muted mt-1 text-sm">{plan.tagline}</p>

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="text-foreground flex items-center gap-2 text-sm">
            <FiCheck className="text-accent-strong" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-border pt-5">
        <p className="tabular-fa text-foreground text-2xl font-black">
          {plan.price}
          <span className="text-muted mr-1 text-xs font-normal">تومان</span>
        </p>
        <p className="text-muted mt-1 text-xs">{plan.billedFor}</p>
        <Link
          href="/products"
          className={
            plan.bestValue
              ? 'bg-accent text-black hover:bg-accent-strong mt-5 flex h-11 w-full items-center justify-center rounded-md text-sm font-black transition-colors'
              : 'border-border text-foreground hover:border-accent mt-5 flex h-11 w-full items-center justify-center rounded-md border text-sm font-black transition-colors'
          }
        >
          مشاهده محصولات
        </Link>
      </div>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="price" className="space-y-8">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-muted text-sm font-bold">طرح‌ها</p>
        <h2 className="text-foreground mt-2 text-2xl font-black sm:text-[28px]">قیمت و طرح‌ها</h2>
      </div>

      <Tabs
        defaultTabId="monthly"
        items={periods.map((period) => ({
          id: period.id,
          label: period.label,
          content: (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {period.plans.map((plan) => (
                <PricingBox plan={plan} key={plan.name} />
              ))}
            </div>
          ),
        }))}
      />
    </section>
  );
}
