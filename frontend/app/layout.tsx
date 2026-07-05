import type { PropsWithChildren } from "react";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

export const metadata = {
  title: "Showcase",
  description: "فروشگاه مکمل‌های بدنسازی",
};

export default function RootLayout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body
        dir="rtl"
        className="min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
