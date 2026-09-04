import type { PropsWithChildren } from "react";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AppShell from "./components/AppShell";
import { AuthProvider } from "./providers/AuthProvider";

export const metadata = {
  title: "فیت مکمل | مکمل‌های بدنسازی",
  description: "فروشگاه مکمل‌های بدنسازی با راهنمای انتخاب شفاف و ساده",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <ToastContainer rtl stacked />
      </body>
    </html>
  );
}
