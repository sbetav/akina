"use client";

import {
  BarChart2,
  Building2,
  FileCheck,
  FileText,
  Package,
  Users,
} from "lucide-react";
import * as motion from "motion/react-client";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: FileText,
    title: "Facturas Electrónicas",
    description:
      "Crea y valida facturas ante la DIAN en tiempo real con número de resolución oficial y firma electrónica.",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    icon: FileCheck,
    title: "Documentos Soporte",
    description:
      "Gestiona documentos electrónicos para compras realizadas a personas no obligadas a facturar.",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    description:
      "Directorio completo con información fiscal, datos de contacto e historial de facturas por cliente.",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    icon: Package,
    title: "Catálogo de Productos",
    description:
      "Administra productos y servicios con precios, impuestos, unidades de medida y códigos UNSPSC.",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    icon: Building2,
    title: "Proveedores",
    description:
      "Centraliza la información de tus proveedores y gestiona los documentos de compra asociados.",
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    icon: BarChart2,
    title: "Analíticas & Dashboard",
    description:
      "Gráficos de ingresos mensuales y estado de facturas en un panel de control centralizado.",
    span: "lg:col-span-1 lg:row-span-1",
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay: i * 0.08,
    },
  }),
};

export default function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
            Funcionalidades
          </p>
          <h2 className="mb-4 font-sans text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Todo lo que necesitas
            <br />
            para facturar
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Una plataforma completa para gestionar tu facturación electrónica de
            principio a fin, en cumplimiento con la normativa de la DIAN.
          </p>
        </motion.div>

        {/* Bento grid — 2 large on top, 4 below on desktop; 2-col on tablet; 1-col on mobile */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
                className={cn(
                  "bento-card group relative overflow-hidden p-8",
                  feature.span,
                  // First two cards span full width on large screens for the "asymmetric" feel
                  i < 2 && "lg:col-span-1",
                )}
              >
                {/* Hover accent bar */}
                <div className="group-hover:bg-primary absolute top-0 bottom-0 left-0 w-[2px] bg-transparent transition-all duration-400" />

                {/* Hover background glow */}
                <div className="from-primary/3 pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

                {/* Icon */}
                <div className="bg-primary/10 border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 relative mb-6 inline-flex h-11 w-11 items-center justify-center border transition-all duration-300">
                  <Icon
                    size={18}
                    className="text-primary transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="text-foreground mb-2 font-sans text-base font-semibold">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground relative font-sans text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
