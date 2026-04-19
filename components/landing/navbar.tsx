"use client";

import { ArrowRightIcon } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/ui/app-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GitHubIcon } from "../icons/github-icon";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        delay: 0.5,
      }}
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-transparent transition-all duration-300",
        {
          "bg-background/90 border-border backdrop-blur-md": scrolled,
        },
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center transition-opacity duration-200 hover:opacity-80"
        >
          <AppLogo size={28} />
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/sbetav/akina"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
            })}
            aria-label="Ver repositorio en GitHub"
          >
            <GitHubIcon />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "default-subtle",
            })}
          >
            Comenzar
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
