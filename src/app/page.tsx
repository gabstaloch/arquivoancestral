"use client";

import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { DiagnosticForm } from "@/components/landing/diagnostic-form";
import { CaseStudy } from "@/components/landing/case-study";
import { Faq } from "@/components/landing/faq";
import { FloatingWhatsApp } from "@/components/landing/floating-whatsapp";
import { SiteFooter } from "@/components/landing/site-footer";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />

        {/* Countries trust band */}
        <section
          aria-label="Países atendidos"
          className="border-b border-border bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs font-600 uppercase tracking-[0.2em] text-muted-foreground">
                Arquivos consultados na Europa
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {SITE.cities.map((c) => (
                  <span
                    key={c}
                    className="font-serif text-sm font-600 text-navy/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Pricing />
        <DiagnosticForm />
        <CaseStudy />
        <Faq />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  );
}
