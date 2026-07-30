"use client";

import { ClipboardList, Search, ScrollText } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Diagnóstico Inicial",
    desc: "Você preenche o que sabe sobre a sua família, sem custo. Avaliamos as chances reais de localização antes de qualquer cobrança.",
  },
  {
    n: "02",
    icon: Search,
    title: "Pesquisa Investigativa",
    desc: "Buscamos nos arquivos históricos digitais, paróquias e cartórios na Europa, cruzando grafias, datas e localidades antigas.",
  },
  {
    n: "03",
    icon: ScrollText,
    title: "Certidão na Mão",
    desc: "Localizamos a certidão oficial, solicitamos a cópia autenticada e enviamos para você pronta para o processo de cidadania.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-600 uppercase tracking-[0.22em] text-gold-dark">
            Método do Arquivo
          </span>
          <h2 className="mt-3 font-serif text-3xl font-700 text-navy sm:text-4xl">
            Como Funciona a Pesquisa
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Um processo transparente em três etapas, do primeiro contato até a
            certidão oficial nas suas mãos.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Steps */}
        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="relative">
                <div className="group h-full rounded-2xl border border-border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-navy/5">
                  {/* Number watermark */}
                  <span className="absolute right-6 top-5 font-serif text-5xl font-700 text-navy/[0.06] transition-colors group-hover:text-gold/15">
                    {step.n}
                  </span>

                  <div className="flex size-12 items-center justify-center rounded-xl bg-navy text-gold ring-1 ring-gold/30">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-600 text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>

                {/* Connector arrow (desktop) */}
                {idx < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <div className="flex size-6 items-center justify-center rounded-full border border-gold/40 bg-cream text-gold">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M2 6h8m0 0L6.5 2.5M10 6L6.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
