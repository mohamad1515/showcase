import type { PropsWithChildren } from "react";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./providers/AuthProvider";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

export const metadata = {
  title: "فیت مکمل | مکمل‌های بدنسازی",
  description: "فروشگاه مکمل‌های بدنسازی با راهنمای انتخاب شفاف و ساده",
};

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
        <ToastContainer rtl stacked />
      </body>
    </html>
  );
}
