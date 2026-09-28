import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tempero da Vovó Marly",
  description: "Cardápio online com pedidos pelo delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
