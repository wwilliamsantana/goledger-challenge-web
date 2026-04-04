import type { Metadata } from "next";
import { Roboto_Condensed, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "LedgerCast — TV Show Manager",
    template: "%s | LedgerCast",
  },
  icons: {
    icon: "/favicon.ico"
  },
  description:
    "Gerencie séries, temporadas e episódios com imutabilidade e rastreabilidade na blockchain GoLedger.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "LedgerCast",
    title: "LedgerCast — TV Show Manager",
    description:
      "Plataforma de gerenciamento de séries de TV com registro imutável em blockchain GoLedger.",
    locale: "pt_BR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${robotoCondensed.variable} ${roboto.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden">
        <Header />
        <main className="flex-1 px-4 py-8">{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
