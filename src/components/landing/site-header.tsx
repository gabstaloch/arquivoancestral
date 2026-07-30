"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { whatsappLink, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Investimento", href: "#investimento" },
  { label: "Diagnóstico", href: "#diagnostico" },
  { label: "Casos", href: "#casos" },
  { label: "Dúvidas", href: "#duvidas" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-navy/95 backdrop-blur-md shadow-lg shadow-navy/10"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:h-28 sm:px-6 lg:px-8">
        {/* Brand com Logo */}
        <a href="#topo" className="flex items-center gap-3 group">
          <div className="relative size-[100px] shrink-0 sm:size-[120px] mt-5">
            <Image
              src="/logo-arquivo-ancestral.png"
              alt={`${SITE.brand} - Logo`}
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="flex flex-col leading-tight justify-center">
            <span className="font-serif text-base font-700 text-white sm:text-lg">
              {SITE.brand}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-gold/80 sm:text-[11px]">
              Genealogia Europeia
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            className="border-gold/50 bg-transparent text-gold hover:bg-gold hover:text-navy"
          >
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
          <Button asChild className="bg-gold text-navy hover:bg-gold-dark">
            <a href="#diagnostico">Diagnóstico Gratuito</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-md text-white lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-navy/98 backdrop-blur-md border-t border-white/10">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild className="bg-gold text-navy hover:bg-gold-dark">
                <a href="#diagnostico" onClick={() => setOpen(false)}>
                  Diagnóstico Gratuito
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gold/50 bg-transparent text-gold hover:bg-gold hover:text-navy"
              >
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  Falar via WhatsApp
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
