import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Unterlagen einreichen — Jucker Treuhand",
  description: "Laden Sie Ihre Steuer- und Buchhaltungsunterlagen sicher hoch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 sm:px-6 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
