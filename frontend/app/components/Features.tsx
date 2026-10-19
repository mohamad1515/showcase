import { FiAward, FiShield, FiTruck } from 'react-icons/fi';

const features = [
  {
    icon: FiAward,
    count: '۰۱',
    title: 'کیفیت تضمین‌شده',
    description: 'ترکیبات هر محصول پیش از ورود به فروشگاه بررسی و مستند می‌شود.',
  },
  {
    icon: FiTruck,
    count: '۰۲',
    title: 'ارسال سریع',
    description: 'سفارش‌ها در سریع‌ترین زمان ممکن بسته‌بندی و ارسال می‌شوند.',
  },
  {
    icon: FiShield,
    count: '۰۳',
    title: 'پشتیبانی مطمئن',
    description: 'پیش و پس از خرید، تیم پشتیبانی پاسخگوی سوالات شماست.',
  },
];

export default function Features() {
  return (
    <section id="features" className="space-y-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-muted text-sm font-bold">افزایش انرژی با فیت مکمل</p>
        <h2 className="text-foreground mt-2 text-2xl font-black sm:text-[28px]">
          ویژگی‌های محصول
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.count}
              className="glass relative rounded-lg p-6 text-center"
            >
              <span className="text-border absolute top-4 right-5 text-3xl font-black">
                {feature.count}
              </span>
              <div className="bg-accent/15 text-accent-strong mx-auto grid h-14 w-14 place-items-center rounded-full">
                <Icon size={26} aria-hidden />
              </div>
              <h3 className="text-foreground mt-5 text-base font-black">{feature.title}</h3>
              <p className="text-muted mt-2 text-sm leading-6">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
