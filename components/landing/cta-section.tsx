"use client";

import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GitHubIcon } from "../icons/github-icon";

export default function CtaSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="cta-grainy-bg relative isolate overflow-hidden border"
        >
          {/* Dark overlay */}
          <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-br from-black/96 via-black/82 to-emerald-400/12" />

          {/* Top + bottom gradient fades to card bg */}
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-2 h-24 bg-linear-to-b from-black/40 to-transparent" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-2 h-24 bg-linear-to-b from-transparent to-black/40" />

          {/* Content */}
          <div className="relative z-3 px-8 py-20 text-center sm:px-16 sm:py-24">
            <p className="text-primary mb-3 font-mono text-xs font-semibold tracking-[0.2em] uppercase">
              ¿Listo para empezar?
            </p>
            <h2 className="mb-6 font-sans text-2xl leading-[1.06] font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Empieza a explorar Akina
            </h2>
            <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-xs leading-relaxed sm:text-sm">
              Conecta tus credenciales de Factus, crea facturas y valida
              directamente con la DIAN desde esta demo gratuita.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                Comenzar
                <ArrowRight size={14} />
              </Link>
              <Link
                href="https://github.com/sbetav/akina"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                <GitHubIcon />
                VER CÓDIGO FUENTE
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
