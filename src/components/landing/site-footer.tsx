"use client";

import { useState } from "react";
import { Mail, MessageCircle, ShieldCheck, FileText } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import Image from "next/image";
import { LGPDModal } from "@/components/landing/lgpd-modal";
import { TermosUsoModal } from "@/components/landing/termos-uso-modal";

const FOOTER_LINKS = [
  {
    title: "Pesquisa",
    links: [
      { label: "Como Funciona", href: "#como-funciona" },
      { label: "Investimento", href: "#investimento" },
      { label: "Diagnóstico Gratuito", href: "#diagnostico" },
      { label: "Estudo de Caso", href: "#casos" },
    ],
  },
  {
    title: "Países Atendidos",
    links: SITE.cities.map((c) => ({ label: c, href: "#diagnostico" })),
  },
  {
    title: "Dúvidas",
    links: [
      { label: "Perguntas Frequentes", href: "#duvidas" },
      { label: "Falar via WhatsApp", href: whatsappLink() },
      { label: "Termos de Uso", href: "#", isButton: true },
    ],
  },
];

export function SiteFooter() {
  const [lgpdOpen, setLgpdOpen] = useState(false);
  const [termosOpen, setTermosOpen] = useState(false);

  return (
    <footer className="bg-navy-dark text-white/70">
      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-10 text-center sm:px-6 lg:flex-row lg:text-left">
          <div>
            <h3 className="font-serif text-2xl font-700 text-white">
              Pronto para encontrar o seu passado?
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Comece pelo diagnóstico gratuito. Sem compromisso, sem cobrança
              surpresa.
            </p>
          </div>
          <a
            href="#diagnostico"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-700 text-navy transition-colors hover:bg-gold-dark"
          >
            Iniciar Diagnóstico Gratuito
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand com Logo */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative size-[100px] shrink-0 sm:size-[120px] -my-2">
                <Image
                  src="/logo-arquivo-ancestral.png"
                  alt={`${SITE.brand} - Logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="flex flex-col leading-tight justify-center">
                <span className="font-serif text-base font-700 text-white">
                  {SITE.brand}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-gold/80">
                  Genealogia Europeia
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Pesquisa e localização de certidões europeias para cidadania.
              Especialistas em arquivos da Alemanha, Itália e Leste Europeu, com
              método de risco compartilhado.
            </p>

            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-gold"
              >
                <MessageCircle className="size-4 text-gold" />
                Atendimento via WhatsApp
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-gold"
              >
                <Mail className="size-4 text-gold" />
                {SITE.email}
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="font-serif text-sm font-600 uppercase tracking-wider text-gold/90">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {(link as any).isButton ? (
                        <button
                          onClick={() => setTermosOpen(true)}
                          className="flex items-center gap-1.5 text-sm text-gold/80 transition-colors hover:text-gold font-medium"
                        >
                          <FileText className="size-3.5" />
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          rel={
                            link.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-sm text-white/60 transition-colors hover:text-white"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                  
                  {/* Link LGPD na coluna Dúvidas */}
                  {col.title === "Dúvidas" && (
                    <li>
                      <button
                        onClick={() => setLgpdOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gold/80 transition-colors hover:text-gold font-medium"
                      >
                        <ShieldCheck className="size-3.5" />
                        Política de Privacidade & LGPD
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.brand}. Todos os direitos
            reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button 
              onClick={() => setLgpdOpen(true)}
              className="transition-colors hover:text-gold flex items-center gap-1.5 font-medium"
            >
              <ShieldCheck className="size-3.5" />
              Política de Privacidade & LGPD
            </button>
            <button 
              onClick={() => setTermosOpen(true)}
              className="transition-colors hover:text-gold flex items-center gap-1.5 font-medium"
            >
              <FileText className="size-3.5" />
              Termos de Uso
            </button>
            <a href="/login" className="transition-colors hover:text-gold text-white/30">
              Painel Interno
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-2 rounded-lg bg-white/[0.03] p-3.5 text-[11px] leading-relaxed text-white/40">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold/60" />
          <p>
            A {SITE.brand} é um serviço independente de pesquisa genealógica e
            localização documental. Não possui vínculo com órgãos governamentais
            ou consulares. A taxa de sucesso é cobrada exclusivamente mediante a
            localização efetiva do registro solicitado. Resultados podem variar
            conforme o estado de conservação dos arquivos e a disponibilidade de
            informações fornecidas pelo requerente.
          </p>
        </div>

        {/* Badge LGPD */}
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => setLgpdOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
          >
            <ShieldCheck className="size-4 text-gold/60 group-hover:text-gold" />
            <span className="text-[10px] text-white/40 group-hover:text-white/60 tracking-wide">
              SEU DADOS PROTEGIDOS PELA LGPD
            </span>
          </button>
        </div>
      </div>

      {/* Modal LGPD */}
      <LGPDModal isOpen={lgpdOpen} onClose={() => setLgpdOpen(false)} />
      
      {/* Modal Termos de Uso */}
      <TermosUsoModal isOpen={termosOpen} onClose={() => setTermosOpen(false)} />
    </footer>
  );
}
