import type { Metadata } from "next";
import { Merriweather_Sans } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather_Sans({
  variable: "--font-merriwreather-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "partial epoch db",
  description: "provides partial & incomplete epoch item data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${merriweather.variable} antialiased font-main`}>
        {children}
      </body>
    </html>
  );
}
