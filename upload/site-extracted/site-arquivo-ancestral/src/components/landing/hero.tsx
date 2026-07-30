"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MessageCircle, ArrowRight, FileSearch } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import Image from "next/image";

export function Hero() {
  return (
    <section
      id="topo"
      className="relative isolate overflow-hidden bg-navy text-white"
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-archive.jpg"
          alt="Arquivo histórico europeu com registros antigos"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/85 to-navy-dark/90" />
        <div className="absolute inset-0 paper-grain" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Copy */}
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-gold-light backdrop-blur-sm">
              <FileSearch className="size-3.5" />
              Pesquisa Genealógica &amp; Arquivos Europeus
            </div>

            <h1 className="font-serif text-3xl font-700 leading-tight sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
              Encontramos a Certidão do seu{" "}
              <span className="text-gold-gradient">Ancestral Europeu</span> no
              Exterior
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Especialistas em pesquisa genealógica e busca de documentos na{" "}
              <span className="font-medium text-white">Alemanha, Itália e Leste
              Europeu</span>. Descubra sua linhagem e garanta seu direito à
              cidadania.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-gold text-base font-600 text-navy shadow-lg shadow-gold/20 hover:bg-gold-dark hover:text-navy"
              >
                <a href="#diagnostico">
                  Fazer Diagnóstico Gratuito
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-base font-500 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Falar via WhatsApp
                </a>
              </Button>
            </div>

            {/* Proof badge */}
            <div className="mt-8 inline-flex max-w-xl items-start gap-3 rounded-lg border border-gold/25 bg-white/5 p-3.5 backdrop-blur-sm">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" />
              <p className="text-sm leading-snug text-white/85">
                <span className="font-600 text-white">
                  Método com Taxa de Sucesso:
                </span>{" "}
                você só paga o valor final se o registro do seu ancestral for
                efetivamente localizado.
              </p>
            </div>
          </div>

          {/* Floating stats card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:ml-auto">
              <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-gold/30 to-transparent blur-xl" />
              <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md">
                <p className="font-serif text-sm font-500 uppercase tracking-[0.2em] text-gold/90">
                  Por que confiar
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      k: "+120 anos",
                      v: "Registros localizados desde 1800 até 1950",
                    },
                    {
                      k: "6 países",
                      v: "Alemanha, Itália, Polônia, Áustria e mais",
                    },
                    {
                      k: "24h",
                      v: "Retorno do diagnóstico inicial no seu WhatsApp",
                    },
                  ].map((item) => (
                    <div
                      key={item.k}
                      className="flex items-baseline gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                    >
                      <span className="w-24 shrink-0 font-serif text-lg font-700 text-gold">
                        {item.k}
                      </span>
                      <span className="text-sm leading-snug text-white/75">
                        {item.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gold rule */}
      <div className="gold-rule" />
    </section>
  );
}
