import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="bg-foreground flex flex-col items-center justify-between gap-4 rounded-lg px-6 py-8 text-center text-white sm:flex-row sm:text-right sm:px-10">
      <h2 className="text-lg font-black sm:text-xl">
        هر زمان و هر کجا، درخواست مشاورهٔ رایگان بدهید
      </h2>
      <Link
        href="/contact"
        className="bg-accent text-foreground hover:bg-accent-strong inline-flex h-11 shrink-0 items-center rounded-md px-6 text-sm font-black transition-colors"
      >
        ثبت درخواست مشاوره
      </Link>
    </section>
  );
}
