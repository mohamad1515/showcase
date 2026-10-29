import { FiBookOpen, FiPackage, FiSearch } from 'react-icons/fi';

const features = [
  {
    id: 1,
    icon: FiSearch,
    title: 'بررسی مشخصات',
    description: 'اطلاعات درج‌شده برای هر محصول را پیش از خرید بررسی کنید.',
  },
  {
    id: 2,
    icon: FiPackage,
    title: 'تنوع محصولات',
    description: 'محصولات را بر اساس دسته‌بندی و برند مرور کنید.',
  },
  {
    id: 3,
    icon: FiBookOpen,
    title: 'مطالعه و مقایسه',
    description: 'مشخصات محصولات را کنار هم بررسی و انتخاب آگاهانه‌تری داشته باشید.',
  },
];

export default function Features() {
  return (
    <section id="features" className="space-y-10">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-muted text-sm font-bold">افزایش انرژی با فیت مکمل</p>
        <h2 className="text-foreground mt-2 text-2xl font-black sm:text-[28px]">ویژگی‌های محصول</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="glass relative rounded-lg p-6 text-center">
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
