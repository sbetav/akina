import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akina | Facturación electrónica",
  description: "Facturación electrónica sin complicaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={cn(
          jetBrainsMono.variable,
          spaceGrotesk.variable,
          "font-mono antialiased",
        )}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
