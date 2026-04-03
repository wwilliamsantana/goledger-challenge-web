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
  title: "StreamHub — TV Show Manager",
  description: "Manage TV Shows, Seasons & Episodes on GoLedger blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoCondensed.variable} ${roboto.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
