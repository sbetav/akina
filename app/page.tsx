import AppPreview from "@/components/landing/app-preview";
import CtaSection from "@/components/landing/cta-section";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import Partners from "@/components/landing/partners";

export default function Page() {
  return (
    <main className="bg-background min-h-dvh">
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
