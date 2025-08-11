import type { Metadata } from "next";
import { Merriweather_Sans } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather_Sans({
  variable: "--font-merriwreather-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PARTIAL PROJECT EPOCH DB",
  description:
    "provides partial & very in-complete epoch item data for build 3466",
  icons: {
    icon: "/peon.webp",
    shortcut: "/peon.webp",
    apple: "/peon.webp",
  },
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
