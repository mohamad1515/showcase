import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

const vazir = localFont({
  src: [
    {
      path: "../public/fonts/Vazir.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazir.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فیت مکمل | معرفی مکمل‌های بدنسازی",
  description:
    "وب‌سایت RTL برای معرفی مکمل‌های بدنسازی، محصولات محبوب و صفحه اختصاصی هر محصول.",
};

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/#about", label: "درباره ما" },
  { href: "/#contact", label: "تماس با ما" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var savedTheme = localStorage.getItem("site-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var activeTheme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.classList.toggle("dark", activeTheme === "dark");
  document.documentElement.style.colorScheme = activeTheme;
} catch (_) {}
`,
          }}
        />
      </head>
      <body
        className={`${vazir.variable} bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-black text-foreground">
                  فیت مکمل
                </Link>
                <nav
                  className="hidden items-center gap-1 md:flex"
                  aria-label="منوی اصلی"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-surface hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {children}

          <footer id="contact" className="border-t border-border bg-surface">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 lg:px-12">
              <div>
                <h2 className="text-xl font-black text-foreground">فیت مکمل</h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  معرفی مکمل‌های ورزشی برای انتخاب آگاهانه‌تر. توضیحات این سایت
                  جایگزین مشاوره پزشک یا متخصص تغذیه نیست.
                </p>
              </div>
              <div>
                <h3 className="font-black text-foreground">دسترسی سریع</h3>
                <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-muted">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-black text-foreground">تماس با ما</h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  تهران، خیابان ورزش، پلاک ۲۴
                  <br />
                  ۰۲۱-۱۲۳۴۵۶۷۸
                  <br />
                  info@fitmokamel.ir
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
