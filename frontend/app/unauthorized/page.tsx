import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="rounded-lg border border-danger/20 bg-danger-soft px-8 py-12 shadow-[var(--shadow-card)]">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-danger">
          دسترسی غیرمجاز
        </p>
        <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">
          شما اجازه مشاهده این بخش را ندارید.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          این بخش فقط برای کاربران با نقش ادمین قابل دسترسی است. لطفا با حساب مناسب وارد شوید یا به صفحه اصلی بازگردید.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-black text-white transition-[background-color,transform] duration-150 ease-out hover:bg-accent-strong active:scale-[0.97]"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
