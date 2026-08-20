import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const messages = getMessages(await getLocale());
  return {
    metadataBase: new URL(defaultUrl),
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
