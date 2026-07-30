"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Quote, MapPin, CalendarDays, FileCheck2 } from "lucide-react";

export function CaseStudy() {
  return (
    <section id="casos" className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-600 uppercase tracking-[0.22em] text-gold-dark">
            Estudo de Caso Real
          </span>
          <h2 className="mt-3 font-serif text-3xl font-700 text-navy sm:text-4xl">
            Da Silésia ao Brasil: Um Registro Reencontrado
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Card */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            {/* Image */}
            <div className="relative min-h-[280px] lg:min-h-full">
              <Image
                src="/case-study.jpg"
                alt="Registro paroquial alemão de 1897 aberto sobre uma mesa"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 via-transparent to-transparent lg:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <Badge className="bg-navy/90 text-gold-light hover:bg-navy">
                  <CalendarDays className="mr-1 size-3" />
                  1897
                </Badge>
                <Badge className="bg-gold/90 text-navy hover:bg-gold">
                  <MapPin className="mr-1 size-3" />
                  Silésia / Alemanha
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <Quote className="size-9 text-gold/40" />
              <h3 className="mt-4 font-serif text-xl font-600 leading-snug text-navy sm:text-2xl">
                Como localizamos o registro de nascimento de 1897 na região da
                Silésia após o cliente passar anos procurando.
              </h3>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                O cliente já havia tentado por conta própria junto a órgãos
                alemães e poloneses, sem sucesso. A região da Silésia mudou de
                jurisdição diversas vezes ao longo do século XX, e os registros
                estavam espalhados entre arquivos de Berlim, Breslávia (Wrocław)
                e paróquias locais.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Nossa equipe cruzou variações do sobrenome{" "}
                <span className="font-600 text-navy">"Köhler / Köhlerin"</span>,
                identificou a paróquia correta pré-1945 e solicitou a cópia
                autenticada diretamente do livro registral original. Em{" "}
                <span className="font-600 text-navy">11 semanas</span>, a
                certidão estava na mão do cliente — pronta para o processo de
                cidadania alemã.
              </p>

              {/* Result stats */}
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-6">
                <Stat value="11" label="semanas de pesquisa" />
                <Stat value="3" label="arquivos consultados" />
                <Stat value="100%" label="autenticado pelo órgão" />
              </div>

              <div className="mt-7 flex items-center gap-3 rounded-lg bg-cream p-4">
                <FileCheck2 className="size-5 shrink-0 text-gold-dark" />
                <p className="text-xs leading-snug text-muted-foreground">
                  <span className="font-600 text-navy">Depoimento:</span> "Depois
                  de anos batendo em portas erradas, eles encontraram em poucos
                  meses. Profissionalismo do início ao fim."
                  <span className="font-500 text-navy"> R. Köhler, SC</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-700 text-gold-dark">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
