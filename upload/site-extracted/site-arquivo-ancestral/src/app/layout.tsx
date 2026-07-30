import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arquivo Ancestral | Pesquisa de Certidões Europeias para Cidadania",
  description:
    "Especialistas em pesquisa genealógica e busca de documentos na Alemanha, Itália e Leste Europeu. Descubra sua linhagem e garanta seu direito à cidadania. Diagnóstico gratuito.",
  keywords: [
    "cidadania europeia",
    "pesquisa genealógica",
    "certidões europeias",
    "certidão de nascimento Alemanha",
    "certidão Itália",
    "ancestral europeu",
    "genealogia Leste Europeu",
  ],
  authors: [{ name: "Arquivo Ancestral" }],
  openGraph: {
    title: "Arquivo Ancestral | Pesquisa de Certidões Europeias",
    description:
      "Encontramos a certidão do seu ancestral europeu no exterior. Diagnóstico gratuito e taxa de sucesso compartilhada.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
