"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  FileSearch,
  Handshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const INCLUDED_ANALISE = [
  "Investigação exaustiva em cartórios e paróquias brasileiros",
  "Levantamento de certidões de nascimento, casamento e óbito",
  "Cruzamento de dados de imigração e registros de entrada",
  "Relatório completo do mapeamento da linhagem familiar",
];

const INCLUDED_SUCESSO = [
  "Pesquisa aprofundada em arquivos da Europa",
  "Cruzamento de grafias e variações de nomes",
  "Solicitação da certidão oficial autenticada",
  "Envio digital + física da certidão localizada",
];

export function Pricing() {
  return (
    <section id="investimento" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-600 uppercase tracking-[0.18em] text-gold-dark">
            <Handshake className="size-3.5" />
            Duas Etapas Distintas
          </span>
          <h2 className="mt-4 font-serif text-3xl font-700 text-navy sm:text-4xl">
            Como Funciona Nossa Cobrança
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Nosso trabalho é dividido em duas etapas claras: primeiro mapeamos toda
            sua linhagem no Brasil (etapa remunerada), depois buscamos a certidão na
            Europa (só cobrada se encontrarmos).
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Análise Inicial */}
          <div className="relative flex flex-col rounded-2xl border border-border bg-cream p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-navy/10 text-navy">
                <FileSearch className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-600 text-navy">
                  Pesquisa &amp; Mapeamento no Brasil
                </h3>
                <p className="text-xs text-muted-foreground">
                  Investigação completa no território nacional
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-xs font-500 text-muted-foreground">R$</span>
              <span className="font-serif text-4xl font-700 text-navy">
                250
              </span>
              <span className="text-sm text-muted-foreground">/ fixo</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Valor que remunera todo o trabalho investigativo de reconstrução da
              sua linha de descendência no Brasil. Este valor{" "}
              <span className="font-600 text-navy">não é reembolsável</span>,
              pois corresponde a um serviço efetivamente prestado e entregue.
            </p>

            <ul className="mt-6 space-y-3">
              {INCLUDED_ANALISE.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-dark" />
                  <span className="text-sm leading-snug text-foreground/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <Button
                asChild
                variant="outline"
                className="w-full border-navy/30 text-navy hover:bg-navy hover:text-white"
              >
                <a href="#diagnostico">Iniciar Diagnóstico</a>
              </Button>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-gold bg-white p-7 shadow-xl shadow-gold/10 sm:p-8">
            <div className="absolute right-0 top-0 bg-gold px-4 py-1.5 text-[11px] font-700 uppercase tracking-wider text-navy">
              Você só paga se encontrar
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-600 text-navy">
                  Taxa de Sucesso na Europa
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cobrada apenas se localizarmos o documento
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-xs font-500 text-muted-foreground">
                a partir de
              </span>
              <span className="font-serif text-4xl font-700 text-navy">
                R$ 1.200
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Cobrada{" "}
              <span className="font-600 text-navy">APENAS</span> se a certidão
              oficial do seu ancestral for localizada no arquivo ou órgão europeu
              competente. Se não encontrarmos, esta taxa{" "}
              <span className="font-600 text-navy">não é cobrada</span>.
            </p>

            <ul className="mt-6 space-y-3">
              {INCLUDED_SUCESSO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-dark" />
                  <span className="text-sm leading-snug text-foreground/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-7">
              <Button
                asChild
                className="w-full bg-gold text-navy hover:bg-gold-dark"
              >
                <a href="#diagnostico">Quero Encontrar Meu Ancestral</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mx-auto mt-10 flex max-w-4xl items-center justify-center gap-2 rounded-xl border border-border bg-cream px-5 py-4 text-center">
          <ShieldCheck className="size-5 shrink-0 text-gold-dark" />
          <p className="text-sm text-muted-foreground">
            <span className="font-600 text-navy">Transparência total:</span>{" "}
            você recebe o relatório completo do mapeamento feito no Brasil,
            independentemente de prosseguirmos para a busca na Europa. Sem letras
            miúdas.
          </p>
        </div>
      </div>
    </section>
  );
}
