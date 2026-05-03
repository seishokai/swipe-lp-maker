import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swipe LP Maker",
  description: "Mobile-first swipe landing page maker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
