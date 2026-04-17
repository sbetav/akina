"use client";

import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";

export default function Partners() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="group border-border/70 hover:border-primary/40 hover:shadow-primary/10 bg-card/40 hover:bg-card relative overflow-hidden border backdrop-blur-sm transition-all duration-400 hover:shadow-[0_0_32px_-8px]"
        >
          <Link
            href="https://www.factus.com.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 grid items-center gap-6 px-6 py-6 sm:grid-cols-[1fr_auto] sm:px-8"
            aria-label="Visitar sitio oficial de Factus"
          >
            <div className="space-y-2">
              <p className="text-primary font-mono text-xs font-semibold uppercase">
                Powered by Factus
              </p>
              <p className="text-foreground font-sans text-lg leading-tight font-semibold sm:text-2xl">
                La API de facturación más rápida y confiable.
              </p>
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                Akina utiliza este servicio para la emisión de documentos
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:justify-start">
              <div className="relative mb-2 h-16 w-40">
                <Image
                  src="/factus.webp"
                  alt="Factus"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
