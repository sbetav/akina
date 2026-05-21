"use client";

import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { BlurReveal } from "@/components/blur-reveal";
import { buttonVariants } from "@/components/ui/button";
import ColorBends from "../backgrounds/color-bends";
import { GitHubIcon } from "../icons/github-icon";
import { Badge } from "../ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay: i * 0.12,
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-dvh overflow-hidden pt-20">
      {/* ColorBends WebGL background */}
      <div className="absolute inset-0 z-2">
        <div className="absolute inset-0 left-1/2 w-full min-w-[768px] -translate-x-1/2">
          <ColorBends
            rotation={90}
            speed={0.34}
            colors={["#00FF8A"]}
            transparent
            autoRotate={0}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0}
            parallax={0}
            noise={0.4}
            iterations={1}
            intensity={2}
            bandWidth={4.5}
          />
        </div>
      </div>

      {/* Dark overlay */}
      <div className="bg-background/70 pointer-events-none absolute inset-0 z-3" />

      {/* Content */}
      <div className="relative z-3 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-32 sm:px-8 sm:pt-28 sm:pb-36 lg:px-12 lg:pt-32 lg:pb-40">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Badge className="border-primary/30 mb-5 uppercase">
            Facturación Electrónica · Colombia
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="xs:text-4xl mb-6 text-center font-sans text-3xl leading-[1.04] font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          <BlurReveal as="span" className="block" delay={0.1}>
            Factura electrónicamente,
          </BlurReveal>
          <BlurReveal as="span" className="text-primary block" delay={0.24}>
            sin complicaciones.
          </BlurReveal>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="text-foreground/75 mb-10 max-w-2xl text-center font-sans text-sm leading-relaxed sm:text-base"
        >
          Akina es una aplicación construida sobre la API de Factus para el
          envío y validación directa de documentos electrónicos ante la DIAN.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
          className="mb-16 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:mb-20"
        >
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            Comenzar ahora
            <ArrowRight size={14} />
          </Link>
          <Link
            href="https://github.com/sbetav/akina"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "w-full sm:w-auto",
            })}
          >
            <GitHubIcon aria-hidden />
            Ver en GitHub
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="w-full"
        >
          <div className="hover:border-primary/50 hover:outline-primary/15 relative overflow-hidden border-2 outline-6 outline-transparent transition-[border-color,outline-color] duration-300">
            <div className="relative aspect-video w-full">
              <Image
                src="/dashboard.png"
                alt="Akina Dashboard"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="to-background pointer-events-none absolute inset-x-0 bottom-0 z-4 h-64 bg-linear-to-b from-transparent" />
    </section>
  );
}
