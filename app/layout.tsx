import type { Metadata } from "next";
import OkwinFooter from "@/components/layout/OkwinFooter";
import OkwinHeader from "@/components/layout/OkwinHeader";
import MobileBottomMenu from "@/components/layout/MobileBottomMenu";
import PageVisitTracker from "@/components/analytics/PageVisitTracker";
import { I18nProvider } from "@/i18n/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OKWINTV",
  description: "Live match page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col pb-[86px] sm:pb-0">
        <I18nProvider>
          <OkwinHeader />
          {children}
          <OkwinFooter />
          <MobileBottomMenu />
          <PageVisitTracker />
        </I18nProvider>
      </body>
    </html>
  );
}
