import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gamified Resource Planning",
  description: "Plan your resources, level up your team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
