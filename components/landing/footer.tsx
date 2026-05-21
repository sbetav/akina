"use client";

import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/ui/app-logo";
import { DEMO_DISCLAIMER } from "@/lib/constants";
import { GitHubIcon } from "../icons/github-icon";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";

const NAV_LINKS = [
  { label: "Entrar", href: "/login" },
  { label: "Registrarse", href: "/register" },
] as const;

const APP_NAME = "AKINA";

export default function Footer() {
  return (
    <footer className="border-border bg-card/20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 pb-7 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
          <AppLogo size={32} />

          {/* Right: Nav links + GitHub */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-mono text-xs transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://github.com/sbetav/akina"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
              })}
              aria-label="GitHub"
            >
              <GitHubIcon />
            </Link>
          </div>
        </div>

        {/* Powered by Factus + Bottom bar */}
        <div className="flex flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground font-mono text-xs tracking-tight">
            © 2026 {APP_NAME} | Made with ❤️ by{" "}
            <Link
              href="https://github.com/sbetav"
              target="_blank"
              className="text-foreground/80 hover:underline"
            >
              sbetav
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs">
              Powered by
            </span>
            <div className="relative mb-[3px] h-15 w-15">
              <Link
                href="https://factus.com.co"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-16 w-16"
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

        <Separator className="mt-6 mb-7" />

        <p className="text-muted-foreground text-center text-[10px]">
          *{DEMO_DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
