import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarkov Kappa",
  description: "Planilha para itens encontrados do Kappa",
  generator: "Rodolpho-Alvim",
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
