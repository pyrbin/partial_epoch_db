import type { Metadata } from "next";
import { Merriweather_Sans } from "next/font/google";
import "./globals.css";
import { getAssetPath } from "@/utils/paths";

const merriweather = Merriweather_Sans({
  variable: "--font-merriwreather-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PARTIAL PROJECT EPOCH DB",
  description:
    "provides partial & very in-complete epoch item data for build 3466",
  icons: {
    icon: getAssetPath("/peon.webp"),
    shortcut: getAssetPath("/peon.webp"),
    apple: getAssetPath("/peon.webp"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={`${merriweather.variable} antialiased font-main`}>
        {children}
      </body>
    </html>
  );
}
