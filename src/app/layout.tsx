import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tempero da Vovó Marly",
  description: "Sabor de casa, carinho de vó.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
