import { storeHighlights } from '../data/home-content';

export default function HomeTrustStrip() {
  return (
    <section aria-label="قابلیت‌های فروشگاه" className="bg-accent text-foreground w-full">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-black/15 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-5 lg:px-6">
        {storeHighlights.map(({ id, title, description, icon: Icon }) => (
          <div key={id} className="flex min-h-24 items-center gap-4 py-5 sm:px-5 lg:px-7">
            <Icon size={22} aria-hidden className="shrink-0" />
            <div>
              <h2 className="text-sm font-black">{title}</h2>
              <p className="text-foreground/75 mt-1 text-xs leading-5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
