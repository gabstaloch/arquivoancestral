# Arquivo Ancestral — Landing Page

Landing page para serviço de pesquisa e localização de certidões europeias
para cidadania (Alemanha, Itália, Polônia, etc.).

## Como usar no Z.ai (nova aba)

1. **Inicie um novo projeto Next.js** no Z.ai (o scaffold padrão já vem com
   Next.js 16 + Tailwind CSS 4 + shadcn/ui + TypeScript).

2. **Copie os arquivos** desta pasta para o projeto, respeitando a estrutura:

   ```
   projeto/
   ├── src/
   │   ├── app/
   │   │   ├── layout.tsx        ← substituir
   │   │   ├── globals.css       ← substituir
   │   │   └── page.tsx          ← substituir
   │   ├── lib/
   │   │   └── site.ts           ← criar
   │   └── components/
   │       └── landing/          ← criar pasta + 9 arquivos
   │           ├── site-header.tsx
   │           ├── hero.tsx
   │           ├── how-it-works.tsx
   │           ├── pricing.tsx
   │           ├── diagnostic-form.tsx
   │           ├── case-study.tsx
   │           ├── faq.tsx
   │           ├── floating-whatsapp.tsx
   │           └── site-footer.tsx
   └── public/
       ├── hero-archive.jpg      ← criar
       └── case-study.jpg        ← criar
   ```

3. **As imagens** (`hero-archive.jpg` e `case-study.jpg`) já estão incluídas
   nesta pasta em `public/`. Apenas copie-as para a pasta `public/` do projeto.

4. **Configurações necessárias no projeto novo:**
   - O scaffold do Z.ai já vem com todos os componentes shadcn/ui necessários
     (`button`, `input`, `label`, `select`, `accordion`, `badge`, `card`, etc.).
   - As dependências já estão no `package.json` padrão:
     `framer-motion`, `lucide-react`, `next/font`, etc.

5. **Personalize antes de publicar:**
   - Edite `src/lib/site.ts` e troque `WHATSAPP_NUMBER` pelo número real.
   - Edite `email` e `cities` no mesmo arquivo conforme necessário.

## Estrutura de arquivos

```
site-arquivo-ancestral/
├── README.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── lib/
│   │   └── site.ts
│   └── components/
│       └── landing/
│           ├── site-header.tsx
│           ├── hero.tsx
│           ├── how-it-works.tsx
│           ├── pricing.tsx
│           ├── diagnostic-form.tsx
│           ├── case-study.tsx
│           ├── faq.tsx
│           ├── floating-whatsapp.tsx
│           └── site-footer.tsx
└── public/
    ├── hero-archive.jpg
    └── case-study.jpg
```

## Seções da página

1. **Hero** — Título de impacto + CTAs + badge de taxa de sucesso
2. **Faixa de países** — Alemanha, Itália, Polônia, etc.
3. **Como Funciona** — Processo em 3 passos
4. **Investimento** — Modelo de risco compartilhado (R$ 250 + R$ 1.200)
5. **Diagnóstico** — Formulário multi-etapas (3 etapas) com tags "Sem conhecimento"
6. **Estudo de Caso** — Caso real da Silésia/1897
7. **FAQ** — 6 perguntas em accordion
8. **Rodapé** — CTA + links + avisos legais
9. **WhatsApp flutuante** — Botão fixo que aparece ao rolar

## Stack técnica

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (componentes)
- Framer Motion (animações do formulário)
- Lucide React (ícones)
- Fontes: Playfair Display (serifada) + Inter (sans-serif)

## Paleta de cores

- Azul marinho profundo: `#1A2B4C`
- Dourado/Bronze: `#C5A059`
- Off-white: `#F8F9FA`
