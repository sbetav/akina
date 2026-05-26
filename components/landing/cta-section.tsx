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
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="to-primary/30 border bg-linear-to-br from-black/96 via-black/82"
        >
          {/* Content */}
          <div className="px-8 py-20 text-center sm:px-16 sm:py-24">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-primary mb-3 font-mono text-xs font-semibold tracking-[0.2em] uppercase"
            >
              ¿Listo para comenzar?
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-6 font-sans text-2xl leading-[1.06] font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Empieza a explorar Akina
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-muted-foreground mx-auto mb-10 max-w-xl text-xs leading-relaxed sm:text-sm"
            >
              Conecta tus credenciales de Factus, crea facturas y valida
              directamente con la DIAN desde esta demo gratuita.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/login"
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
