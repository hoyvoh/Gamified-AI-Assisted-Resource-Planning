import type { Metadata } from "next";
import { EB_Garamond, Inter, JetBrains_Mono, Orbitron, Geist } from "next/font/google";

import "./globals.css";
import { QueryClientProviderWrapper } from "@/providers/query-client.provider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

// Early Renaissance serif — pairs with Orbitron for body descriptions
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  style: ["normal", "italic"],
});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${orbitron.variable} ${ebGaramond.variable}`}
      >
        <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
      </body>
    </html>
  );
}
