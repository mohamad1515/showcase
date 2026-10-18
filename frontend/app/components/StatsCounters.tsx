import StatCounter from './ui/StatCounter';

const stats = [
  { value: 65, suffix: '%', title: 'مشتریان همیشگی', note: 'تجربه‌ای مطمئن و باکیفیت' },
  { value: 320, suffix: '+', title: 'سفارش ماهانه', note: 'ارسال سریع و پیگیری آسان' },
  { value: 98, suffix: '%', title: 'رضایت خریداران', note: 'بر اساس نظرهای ثبت‌شده' },
];

export default function StatsCounters() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="border-border bg-card rounded-lg border p-6 text-center"
        >
          <p className="text-accent-strong text-4xl font-black">
            <StatCounter value={stat.value} suffix={stat.suffix} />
          </p>
          <h3 className="text-foreground mt-3 text-sm font-black">{stat.title}</h3>
          <p className="text-muted mt-1 text-xs">{stat.note}</p>
        </div>
      ))}
    </section>
  );
}
