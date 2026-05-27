"use client";

import Image from "next/image";
import Link from "next/link";
import type { HTMLAttributeAnchorTarget } from "react";
import { AppLogo } from "@/components/ui/app-logo";
import { APP_NAME, DEMO_DISCLAIMER } from "@/lib/constants";
import { Separator } from "../ui/separator";

const NAV_LINKS: {
  label: string;
  href: string;
  target?: HTMLAttributeAnchorTarget;
}[] = [
  { label: "Iniciar", href: "/login" },
  { label: "Registrarse", href: "/register" },
  {
    label: "Github",
    href: "https://github.com/sbetav/akina",
    target: "_blank",
  },
] as const;

export default function Footer() {
  return (
    <footer className="border-border bg-card/20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 pb-5 sm:space-y-4.5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-10">
          <AppLogo size={26} labelClassName="mt-0.5" />

          {/* Right: Nav links + GitHub */}
          <div className="flex h-full flex-wrap items-center gap-x-6 gap-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.target}
                className="text-muted-foreground hover:text-primary font-mono text-xs transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Powered by Factus + Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-8 sm:mt-0 sm:flex-row">
          <p className="text-muted-foreground font-mono text-xs tracking-tight">
            © 2026 {APP_NAME} | Hecho con{" "}
            <span className="text-[11px]">❤️</span> por{" "}
            <Link
              href="https://github.com/sbetav"
              target="_blank"
              className="text-foreground/90 hover:underline"
            >
              sbetav
            </Link>
          </p>
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground font-mono text-xs">
              Powered by
            </span>
            <div className="relative mb-px h-7 w-16">
              <Link
                href="https://factus.com.co"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-7 w-16"
              >
                <Image
                  src="/factus.webp"
                  alt="Factus"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="mt-10.5 mb-5" />

        <p className="text-muted-foreground text-center text-[11px]">
          *{DEMO_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
