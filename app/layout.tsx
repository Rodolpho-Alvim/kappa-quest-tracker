import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Orbitron, Roboto_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
});

const tarkov = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-tarkov",
});

const tarkovMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tarkov-mono",
});

export const metadata: Metadata = {
  title: "Tarkov Hub",
  description:
    "Seu centro de progresso para Kappa e Hideout no Escape from Tarkov.",
  generator: "Rodolpho-Alvim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${tarkov.variable} ${tarkovMono.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
