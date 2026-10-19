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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('site-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
      </head>
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
