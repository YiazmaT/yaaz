import type {Metadata} from "next";
import {Geist, Geist_Mono, Amatic_SC} from "next/font/google";
import {Analytics} from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amaticSC = Amatic_SC({
  weight: "700",
  variable: "--font-amatic-sc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_COMPANY_NAME!,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${amaticSC.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
