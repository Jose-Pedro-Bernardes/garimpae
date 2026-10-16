import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garimpaê",
  description: "Pesquise estabelecimentos e baixe os resultados em planilha.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="relative isolate flex min-h-dvh flex-col overflow-x-hidden bg-background font-sans text-foreground">
        <div
          aria-hidden="true"
          className="bg-garimpo-glow pointer-events-none absolute inset-0 -z-10 opacity-100 dark:opacity-10"
        />
        <div
          aria-hidden="true"
          className="bg-garimpo-icons pointer-events-none absolute inset-0 -z-10 opacity-100 dark:opacity-30"
        />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
