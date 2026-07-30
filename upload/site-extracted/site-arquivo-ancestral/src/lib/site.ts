// Central site configuration for the Arquivo Ancestral landing page.
// Update WHATSAPP_NUMBER with the real business number (international format, digits only).

export const SITE = {
  brand: "Arquivo Ancestral",
  tagline: "Pesquisa & Localização de Certidões Europeias",
  // Brazilian WhatsApp number in international format (country + DDD + number).
  WHATSAPP_NUMBER: "5511912345678",
  WHATSAPP_MESSAGE:
    "Olá! Gostaria de ajuda para pesquisar os documentos do meu ancestral europeu.",
  email: "contato@arquivoancestral.com.br",
  cities: ["Alemanha", "Itália", "Polônia", "Ucrânia", "Áustria", "Tchéquia"],
} as const;

export function whatsappLink(message: string = SITE.WHATSAPP_MESSAGE) {
  return `https://wa.me/${SITE.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
