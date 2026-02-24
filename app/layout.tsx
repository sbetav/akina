import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
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
  title: "Akina | Sistema POS",
  description: "Sistema POS para la gestión de ventas y inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          jetBrainsMono.className,
          spaceGrotesk.variable,
          "antialiased",
        )}
      >
        {children}
      </body>
    </html>
  );
}
