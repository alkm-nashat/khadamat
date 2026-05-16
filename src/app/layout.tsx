import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "شيّال | اكتشف الخدمة المناسبة لك",
    template: "%s | شيّال",
  },
  description:
    "شيّال — منصة سعودية تربط مقدمي الخدمات بطالبيها في المملكة العربية السعودية",
  keywords: ["شيال", "خدمات", "السعودية", "استشارات", "عقارات", "تعليم", "ترفيه"],
  authors: [{ name: "شيّال" }],
  creator: "شيّال",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXTAUTH_URL || "http://localhost:3002",
    siteName: "شيّال",
    title: "شيّال | اكتشف الخدمة المناسبة لك",
    description:
      "شيّال — منصة سعودية تربط مقدمي الخدمات بطالبيها في المملكة العربية السعودية",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "'Cairo', Arial, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
