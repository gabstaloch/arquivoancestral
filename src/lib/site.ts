// Central site configuration for the Arquivo Ancestral landing page.
// Update WHATSAPP_NUMBER with the real business number (international format, digits only).

export const SITE = {
  brand: "Arquivo Ancestral",
  tagline: "Pesquisa & Localização de Certidões Europeias",
  // Brazilian WhatsApp number in international format (country + DDD + number).
  WHATSAPP_NUMBER: "5547996347286",
  WHATSAPP_MESSAGE:
    "Olá! Gostaria de ajuda para pesquisar os documentos do meu ancestral europeu.",
  email: "arquivoancestralue@gmail.com",
  cities: ["Alemanha", "Itália", "Polônia", "Ucrânia", "Áustria", "Tchéquia"],
} as const;

export function whatsappLink(message: string = SITE.WHATSAPP_MESSAGE) {
  return `https://wa.me/${SITE.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
