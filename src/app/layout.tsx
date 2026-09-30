// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inline SVG favicon — a dark rounded square with a sparkle mark, no separate
// image file needed. Encoded as a data URI so Next.js can serve it directly.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="6" fill="#0F172A"/>
  <path d="M12 5.5l1.4 3.9 3.9 1.4-3.9 1.4-1.4 3.9-1.4-3.9-3.9-1.4 3.9-1.4 1.4-3.9z" fill="#38BDF8"/>
</svg>`;
const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

export const metadata: Metadata = {
  title: "SiteLingo AI — Plain-English Website Audit Tool",
  description:
    "Turn complex PageSpeed and Lighthouse technical metrics into plain-English business insights and actionable fixes.",
  icons: {
    icon: faviconDataUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
