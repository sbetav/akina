"use client";

import * as motion from "motion/react-client";
import Image from "next/image";

export default function AppPreview() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-primary mb-4 font-mono text-xs font-semibold tracking-[0.2em] uppercase">
            Experiencia de usuario
          </p>
          <h2 className="mb-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Una interfaz intuitiva
          </h2>
          <p className="text-muted-foreground mx-auto text-sm leading-relaxed">
            Establece tus flujos de trabajo de forma sencilla y eficiente.
          </p>
        </motion.div>

        {/* Preview container */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          }}
          className="relative"
        >
          {/* Bordered preview card */}
          <div className="hover:border-primary/50 hover:outline-primary/15 relative overflow-hidden border-2 outline-6 outline-transparent transition-all duration-300">
            {/* Dashboard screenshot */}
            <div className="relative aspect-video w-full">
              <Image
                src="/create-invoice.webp"
                alt="Akina Dashboard - Panel de control"
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
