"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Users,
  Globe2,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  PartyPopper,
  MessageCircle,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type FormState = {
  // Step 1
  nome: string;
  email: string;
  whatsapp: string;
  estadoCivil: string;
  // Step 2
  nomePai: string;
  nomeMae: string;
  localBrasil: string;
  anoBrasil: string;
  tipoRegistroBrasil: string;
  // Step 3
  nomeAncestral: string;
  nomeAncestralSem: boolean;
  paisOrigem: string;
  paisOrigemSem: boolean;
  anoChegada: string;
  anoChegadaSem: boolean;
  regiaoOrigem: string;
};

const INITIAL: FormState = {
  nome: "",
  email: "",
  whatsapp: "",
  estadoCivil: "",
  nomePai: "",
  nomeMae: "",
  localBrasil: "",
  anoBrasil: "",
  tipoRegistroBrasil: "",
  nomeAncestral: "",
  nomeAncestralSem: false,
  paisOrigem: "",
  paisOrigemSem: false,
  anoChegada: "",
  anoChegadaSem: false,
  regiaoOrigem: "",
};

const STEP_META = [
  { id: 1, label: "Requerente", icon: User },
  { id: 2, label: "Família", icon: Users },
  { id: 3, label: "Ancestral", icon: Globe2 },
];

export function DiagnosticForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const total = STEP_META.length;
  const progress = (step / total) * 100;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.nome.trim()) e.nome = "Informe seu nome completo.";
      if (!data.email.trim()) e.email = "Informe seu e-mail.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        e.email = "E-mail inválido.";
      if (!data.whatsapp.trim())
        e.whatsapp = "Informe seu WhatsApp com DDD.";
      else if (data.whatsapp.replace(/\D/g, "").length < 10)
        e.whatsapp = "Número incompleto (inclua DDD).";
      if (!data.estadoCivil) e.estadoCivil = "Selecione uma opção.";
    }
    if (s === 2) {
      if (!data.nomePai.trim()) e.nomePai = "Informe o nome do pai.";
      if (!data.nomeMae.trim()) e.nomeMae = "Informe o nome da mãe.";
      if (!data.localBrasil.trim())
        e.localBrasil = "Informe a cidade/estado no Brasil.";
      if (!data.tipoRegistroBrasil)
        e.tipoRegistroBrasil = "Selecione o tipo de registro.";
      if (!data.anoBrasil.trim()) e.anoBrasil = "Informe o ano aproximado.";
      else if (!/^\d{4}$/.test(data.anoBrasil))
        e.anoBrasil = "Use um ano com 4 dígitos.";
    }
    if (s === 3) {
      if (!data.nomeAncestralSem && !data.nomeAncestral.trim())
        e.nomeAncestral = "Informe o nome do ancestral ou marque ‘Sem conhecimento’.";
      if (!data.paisOrigemSem && !data.paisOrigem)
        e.paisOrigem = "Selecione o país de origem ou marque ‘Sem conhecimento’.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, total));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  async function onSubmit() {
    if (!validateStep(total)) return;
    setSubmitting(true);
    // Simulated submission. In production, POST to /api/diagnostico.
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setDone(true);
  }

  return (
    <section id="diagnostico" className="relative bg-navy py-20 sm:py-24">
      {/* Decorative texture */}
      <div className="absolute inset-0 paper-grain opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-600 uppercase tracking-[0.18em] text-gold-light">
            <ShieldCheck className="size-3.5" />
            100% Gratuito
          </span>
          <h2 className="mt-4 font-serif text-3xl font-700 text-white sm:text-4xl">
            Diagnóstico da sua Pesquisa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75">
            Preencha as três etapas abaixo. Nossa equipe analisará as
            informações e retornará em até 24h no seu WhatsApp.
          </p>
        </div>

        {/* Card */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-navy-dark/40">
          {done ? (
            <SuccessState data={data} />
          ) : (
            <>
              {/* Progress */}
              <div className="border-b border-border bg-cream px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between">
                  {STEP_META.map((s) => {
                    const Icon = s.icon;
                    const active = step === s.id;
                    const completed = step > s.id;
                    return (
                      <div
                        key={s.id}
                        className="flex flex-1 items-center"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-full border-2 text-sm font-700 transition-all",
                              completed &&
                                "border-gold bg-gold text-navy",
                              active &&
                                "border-gold bg-navy text-gold",
                              !active &&
                                !completed &&
                                "border-border bg-white text-muted-foreground"
                            )}
                          >
                            {completed ? (
                              <Check className="size-4" />
                            ) : (
                              <Icon className="size-4" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "hidden text-sm font-600 sm:block",
                              active || completed
                                ? "text-navy"
                                : "text-muted-foreground"
                            )}
                          >
                            {s.label}
                          </span>
                        </div>
                        {s.id < total && (
                          <div className="mx-3 h-0.5 flex-1 rounded-full bg-border">
                            <div
                              className={cn(
                                "h-full rounded-full bg-gold transition-all duration-500",
                                step > s.id ? "w-full" : "w-0"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Etapa{" "}
                  <span className="font-700 text-navy">{step}</span> de {total}{" "}
                  · {Math.round(progress)}% concluído
                </p>
              </div>

              {/* Form body */}
              <div className="px-6 py-7 sm:px-8 sm:py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {step === 1 && (
                      <Step1 data={data} errors={errors} update={update} />
                    )}
                    {step === 2 && (
                      <Step2 data={data} errors={errors} update={update} />
                    )}
                    {step === 3 && (
                      <Step3 data={data} errors={errors} update={update} />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Nav buttons */}
                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={back}
                      className="text-navy hover:bg-cream"
                    >
                      <ArrowLeft className="size-4" />
                      Voltar
                    </Button>
                  ) : (
                    <span />
                  )}

                  {step < total ? (
                    <Button
                      type="button"
                      onClick={next}
                      className="bg-navy text-white hover:bg-navy-light"
                    >
                      Próxima Etapa
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={submitting}
                      className="bg-gold text-navy hover:bg-gold-dark"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>Enviar Diagnóstico para Análise Gratuita</>
                      )}
                    </Button>
                  )}
                </div>

                {step === total && (
                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                    <MessageCircle className="size-3.5 text-gold-dark" />
                    Retornaremos em até 24h no seu WhatsApp.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Field helpers ---------- */

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs font-500 text-destructive">{msg}</p>;
}

function FieldLabel({
  children,
  required,
  hint,
  right,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <Label className="text-sm font-600 text-navy">
        {children}
        {required && <span className="ml-0.5 text-gold-dark">*</span>}
      </Label>
      {right ??
        (hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ))}
    </div>
  );
}

/* ---------- "Sem conhecimento" toggle tag ---------- */

function SemConhecimentoTag({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-600 transition-colors",
        active
          ? "border-gold bg-gold text-navy"
          : "border-border bg-cream text-muted-foreground hover:border-gold/50 hover:text-gold-dark"
      )}
    >
      <HelpCircle className="size-3" />
      Sem conhecimento
    </button>
  );
}

/* ---------- Steps ---------- */

type StepProps = {
  data: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

function Step1({ data, errors, update }: StepProps) {
  return (
    <div>
      <h3 className="font-serif text-xl font-600 text-navy">
        Dados do Requerente
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Para que possamos retornar com o diagnóstico.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel required>Nome Completo</FieldLabel>
          <Input
            value={data.nome}
            onChange={(e) => update("nome", e.target.value)}
            placeholder="Ex: Ana Müller da Silva"
            aria-invalid={!!errors.nome}
          />
          <FieldError msg={errors.nome} />
        </div>
        <div>
          <FieldLabel required>E-mail</FieldLabel>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
          />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <FieldLabel required>WhatsApp (com DDD)</FieldLabel>
          <Input
            value={data.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="(11) 91234-5678"
            aria-invalid={!!errors.whatsapp}
          />
          <FieldError msg={errors.whatsapp} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required>Estado Civil</FieldLabel>
          <Select
            value={data.estadoCivil}
            onValueChange={(v) => update("estadoCivil", v)}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={!!errors.estadoCivil}
            >
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
              <SelectItem value="casado">Casado(a)</SelectItem>
              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
              <SelectItem value="uniao">União Estável</SelectItem>
            </SelectContent>
          </Select>
          <FieldError msg={errors.estadoCivil} />
        </div>
      </div>
    </div>
  );
}

function Step2({ data, errors, update }: StepProps) {
  return (
    <div>
      <h3 className="font-serif text-xl font-600 text-navy">
        Árvore Familiar Próxima
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Informações dos seus pais e o registro no Brasil.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel required>Nome do Pai</FieldLabel>
          <Input
            value={data.nomePai}
            onChange={(e) => update("nomePai", e.target.value)}
            placeholder="Nome completo do pai"
            aria-invalid={!!errors.nomePai}
          />
          <FieldError msg={errors.nomePai} />
        </div>
        <div>
          <FieldLabel required>Nome da Mãe</FieldLabel>
          <Input
            value={data.nomeMae}
            onChange={(e) => update("nomeMae", e.target.value)}
            placeholder="Nome completo da mãe"
            aria-invalid={!!errors.nomeMae}
          />
          <FieldError msg={errors.nomeMae} />
        </div>
        <div>
          <FieldLabel required>
            Cidade / Estado (no Brasil)
          </FieldLabel>
          <Input
            value={data.localBrasil}
            onChange={(e) => update("localBrasil", e.target.value)}
            placeholder="Ex: Blumenau / SC"
            aria-invalid={!!errors.localBrasil}
          />
          <FieldError msg={errors.localBrasil} />
        </div>
        <div>
          <FieldLabel required>Tipo de Registro</FieldLabel>
          <Select
            value={data.tipoRegistroBrasil}
            onValueChange={(v) => update("tipoRegistroBrasil", v)}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={!!errors.tipoRegistroBrasil}
            >
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nascimento">Nascimento</SelectItem>
              <SelectItem value="casamento">Casamento</SelectItem>
              <SelectItem value="obito">Óbito</SelectItem>
              <SelectItem value="nao_sei">Não sei informar</SelectItem>
            </SelectContent>
          </Select>
          <FieldError msg={errors.tipoRegistroBrasil} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel required hint="Aproximado, se não souber o exato">
            Ano do Registro (no Brasil)
          </FieldLabel>
          <Input
            value={data.anoBrasil}
            onChange={(e) =>
              update("anoBrasil", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Ex: 1952"
            aria-invalid={!!errors.anoBrasil}
          />
          <FieldError msg={errors.anoBrasil} />
        </div>
      </div>
    </div>
  );
}

function Step3({ data, errors, update }: StepProps) {
  return (
    <div>
      <h3 className="font-serif text-xl font-600 text-navy">
        O Ancestral Estrangeiro
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        O que você sabe (ou presume) sobre quem emigrou para o Brasil. Não se
        preocupe se faltarem dados — marque &ldquo;Sem conhecimento&rdquo;.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel
            required
            right={
              <SemConhecimentoTag
                active={data.nomeAncestralSem}
                onClick={() => {
                  const next = !data.nomeAncestralSem;
                  update("nomeAncestralSem", next);
                  if (next) update("nomeAncestral", "");
                }}
              />
            }
          >
            Nome do Ancestral
          </FieldLabel>
          <Input
            value={data.nomeAncestral}
            onChange={(e) => update("nomeAncestral", e.target.value)}
            placeholder="Ex: Johann Friedrich Müller"
            disabled={data.nomeAncestralSem}
            aria-invalid={!!errors.nomeAncestral}
          />
          <FieldError msg={errors.nomeAncestral} />
        </div>
        <div>
          <FieldLabel
            required
            right={
              <SemConhecimentoTag
                active={data.paisOrigemSem}
                onClick={() => {
                  const next = !data.paisOrigemSem;
                  update("paisOrigemSem", next);
                  if (next) update("paisOrigem", "");
                }}
              />
            }
          >
            País de Origem
          </FieldLabel>
          <Select
            value={data.paisOrigem}
            onValueChange={(v) => update("paisOrigem", v)}
            disabled={data.paisOrigemSem}
          >
            <SelectTrigger
              className="w-full"
              aria-invalid={!!errors.paisOrigem}
            >
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alemanha">Alemanha</SelectItem>
              <SelectItem value="italia">Itália</SelectItem>
              <SelectItem value="polonia">Polônia</SelectItem>
              <SelectItem value="ucrania">Ucrânia</SelectItem>
              <SelectItem value="austria">Áustria</SelectItem>
              <SelectItem value="tchequia">Tchéquia / Tchecoslováquia</SelectItem>
              <SelectItem value="hungria">Hungria</SelectItem>
              <SelectItem value="russia">Rússia</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <FieldError msg={errors.paisOrigem} />
        </div>
        <div>
          <FieldLabel
            right={
              <SemConhecimentoTag
                active={data.anoChegadaSem}
                onClick={() => {
                  const next = !data.anoChegadaSem;
                  update("anoChegadaSem", next);
                  if (next) update("anoChegada", "");
                }}
              />
            }
          >
            Ano de Chegada ao Brasil
          </FieldLabel>
          <Input
            value={data.anoChegada}
            onChange={(e) =>
              update("anoChegada", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Ex: 1923"
            disabled={data.anoChegadaSem}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel hint="Opcional">
            Cidade / Região de Origem (se souber)
          </FieldLabel>
          <Input
            value={data.regiaoOrigem}
            onChange={(e) => update("regiaoOrigem", e.target.value)}
            placeholder="Ex: Região da Silésia / Bremen / Trento"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Success state ---------- */

function SuccessState({ data }: { data: FormState }) {
  const msg = `Olá! Acabei de enviar o diagnóstico pelo site. Meu ancestral é ${data.nomeAncestral || "(a definir)"} e aguardo o retorno. Obrigado(a)!`;
  return (
    <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold/15 ring-4 ring-gold/10">
        <PartyPopper className="size-8 text-gold-dark" />
      </div>
      <h3 className="mt-6 font-serif text-2xl font-700 text-navy">
        Diagnóstico Enviado com Sucesso!
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Recebemos as informações sobre{" "}
        <span className="font-600 text-navy">{data.nome || "você"}</span>. Nossa
        equipe de pesquisa vai analisar o caso e{" "}
        <span className="font-600 text-navy">
          retornará em até 24h no WhatsApp
        </span>{" "}
        informado.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          asChild
          className="bg-[#25D366] text-white hover:bg-[#1ebe57]"
        >
          <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            Acelerar pelo WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="border-navy/30 text-navy">
          <a href="#topo">Voltar ao topo</a>
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Guarde nosso contato: você receberá um e-mail de confirmação em breve.
      </p>
    </div>
  );
}
