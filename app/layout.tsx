import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import "./globals.css";

const metadataBase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
})();

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Akina | Facturación electrónica para Colombia",
    template: "%s | Akina",
  },
  description:
    "Plataforma de facturación electrónica para Colombia, impulsada por Factus. Gestiona facturas, documentos soporte, clientes, proveedores y productos desde un solo lugar.",
  keywords: [
    "facturación electrónica",
    "DIAN",
    "Factus",
    "Colombia",
    "software de facturación",
    "documento soporte",
    "nota crédito",
    "Akina",
  ],
  applicationName: "Akina",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "Akina",
    title: "Akina | Facturación electrónica para Colombia",
    description:
      "Emite y gestiona facturas electrónicas, documentos soporte y notas con una experiencia moderna impulsada por Factus.",
    images: [
      {
        url: "/dashboard-demo.png",
        width: 1200,
        height: 630,
        alt: "Panel principal de Akina para facturación electrónica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akina | Facturación electrónica para Colombia",
    description:
      "Plataforma moderna de facturación electrónica en Colombia, impulsada por Factus.",
    images: ["/dashboard-demo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/app-logo.png", type: "image/png" }],
    apple: [{ url: "/app-logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth">
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
