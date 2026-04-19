import type { Metadata } from "next";
import Script from "next/script";
import AppPreview from "@/components/landing/app-preview";
import CtaSection from "@/components/landing/cta-section";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import Partners from "@/components/landing/partners";

export const metadata: Metadata = {
  title: "Facturación electronica para Colombia",
  description:
    "Akina es una plataforma moderna de facturación electronica en Colombia, impulsada por Factus para emitir y gestionar documentos ante la DIAN.",
  alternates: {
    canonical: "/",
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Akina",
  url: "https://www.akina.dev",
  logo: "https://www.akina.dev/app-logo.png",
  sameAs: ["https://www.factus.com.co/"],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Akina",
  url: "https://www.akina.dev",
  description:
    "Plataforma de facturación electrónica para Colombia impulsada por Factus.",
  inLanguage: "es-CO",
};

const baseUrl = (() => {
  const fallback = "http://localhost:3000";

  try {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? fallback).origin;
  } catch {
    return fallback;
  }
})();

organizationLd.url = baseUrl;
organizationLd.logo = `${baseUrl}/app-logo.png`;
websiteLd.url = baseUrl;

export default function Page() {
  return (
    <main className="bg-background min-h-dvh">
      <Script
        id="ld-org-akina"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Script
        id="ld-website-akina"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <Navbar />
      <Hero />
      <Partners />
      <Features />
      <AppPreview />
      <CtaSection />
      <Footer />
    </main>
  );
}
