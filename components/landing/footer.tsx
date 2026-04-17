"use client";

import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/ui/app-logo";
import { GitHubIcon } from "../icons/github-icon";

const NAV_LINKS = [
  { label: "Entrar", href: "/login" },
  { label: "Registrarse", href: "/register" },
] as const;

const APP_NAME = "AKINA";

export default function Footer() {
  return (
    <footer className="border-border bg-card/20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
          <AppLogo size={32} />

          {/* Right: Nav links + GitHub */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-mono text-xs tracking-[0.15em] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://github.com/sbetav/akina"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </Link>
          </div>
        </div>

        {/* Powered by Factus + Bottom bar */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-muted-foreground font-mono text-xs">
            © 2026 {APP_NAME}.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-sm">
              Powered by
            </span>
            <div className="relative mb-0.5 h-16 w-16">
              <Link
                href="https://factus.com.co"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/factus.webp"
                  alt="Factus"
                  fill
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
