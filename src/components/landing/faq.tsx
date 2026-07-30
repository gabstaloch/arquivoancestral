"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const FAQ = [
  {
    q: "O que acontece se o documento do europeu não for encontrado?",
    a: "Explicamos com total transparência como funciona nosso modelo em duas etapas. O valor inicial de R$ 250 remunera toda a pesquisa minuciosa realizada no Brasil — incluindo levantamento de cartórios, consulta a paróquias, cruzamento de dados de imigração e a montagem completa do mapa da sua linhagem familiar. Esse relatório de mapeamento é entregue a você independentemente do resultado. Se a certidão na Europa não for localizada, você NÃO paga a Taxa de Sucesso (R$ 1.200+). No entanto, o valor da primeira etapa (R$ 250) não é devolvido, pois corresponde a um serviço de investigação que foi efetivamente concluído e entregue.",
  },
  {
    q: "E se meu ancestral tiver mudado de nome no Brasil?",
    a: "É muito comum. Na época da imigração, nomes germânicos, eslavos e italianos foram adaptados, traduzidos ou simplesmente registrados de forma fonética. Faz parte da nossa metodologia cruzar todas as variações plausíveis do nome (Köhler → Köhlerin → Köler → Coler) e identificar a grafia original nos arquivos europeus antes de solicitar a certidão.",
  },
  {
    q: "Quanto tempo demora a pesquisa no exterior?",
    a: "Depende do país, do período e do estado de conservação dos arquivos. Casos em que a paróquia e o ano são conhecidos costumam ser resolvidos entre 4 e 8 semanas. Pesquisas mais complexas, envolvendo regiões com mudança de jurisdição (como a Silésia ou antigos territórios austro-húngaros), podem levar de 8 a 16 semanas. Você recebe um prazo estimado já no diagnóstico inicial.",
  },
  {
    q: "E se o documento tiver sido destruído na Guerra?",
    a: "Embora muitos livros paroquiais e civis tenham sido perdidos nas duas Guerras Mundiais, uma parcela significativa foi microfilmada, duplicada ou transferida para arquivos centrais antes da destruição. Trabalhamos com arquivos estaduais (Landesarchiv), eclesiásticos (Bistumsarchiv) e bases digitalizadas como Matricula e Archion. Quando o original não existe, frequentemente localizamos a cópia ou um registro correlato que comprova a descendência.",
  },
  {
    q: "Vocês fazem todo o processo do consulado ou só a busca das certidões?",
    a: "Somos focados 100% na pesquisa e localização do documento histórico. Não atuamos no processo consular, na tradução juramentada nem no protocolo da cidadania. Acreditamos que a especialização é o que garante a qualidade da nossa entrega: somos excelentes em encontrar registros. Para as etapas seguintes, podemos indicar escritórios parceiros de confiança.",
  },
  {
    q: "Preciso enviar documentos antes do diagnóstico?",
    a: "Não. O diagnóstico inicial é feito a partir das informações que você já tem (nomes, datas aproximadas, locais). Se você possuir cópias de certidões brasileiras, fotos ou registros antigos da família, poderá anexá-los após o envio do formulário, mas não é obrigatório nesta primeira etapa.",
  },
  {
    q: "Quais países vocês atendem?",
    a: "Atuamos principalmente com Alemanha, Itália, Polônia, Ucrânia, Áustria, Tchéquia e Hungria — os principais países de origem da imigração para o Brasil. Para registros de outras regiões da Europa Central e Oriental, avaliamos caso a caso no diagnóstico gratuito.",
  },
];

export function Faq() {
  return (
    <section id="duvidas" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-xs font-600 uppercase tracking-[0.18em] text-navy">
            <HelpCircle className="size-3.5" />
            Dúvidas Frequentes
          </span>
          <h2 className="mt-4 font-serif text-3xl font-700 text-navy sm:text-4xl">
            Perguntas que Recebemos
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Reunimos as perguntas mais comuns antes de iniciar uma pesquisa
            genealógica no exterior.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="mt-10 divide-y divide-border rounded-2xl border border-border bg-cream/40 px-5 sm:px-7"
        >
          {FAQ.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border-b-0 py-1"
            >
              <AccordionTrigger className="py-5 text-left font-serif text-base font-600 text-navy hover:no-underline sm:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-cream p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-serif text-lg font-600 text-navy">
              Ainda tem dúvidas?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Fale com um pesquisador diretamente no WhatsApp — sem compromisso.
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 bg-[#25D366] text-white hover:bg-[#1ebe57]"
          >
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" />
              Tirar minha dúvida
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
