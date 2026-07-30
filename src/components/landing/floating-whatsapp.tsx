"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pulse the label after a delay to draw attention.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setShowLabel(true), 1200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-end gap-2 transition-all duration-500 sm:bottom-6 sm:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      )}
    >
      {/* Label bubble */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar via WhatsApp"
        className={cn(
          "mb-1 hidden max-w-[220px] rounded-2xl rounded-br-sm border border-[#1ebe57]/30 bg-white px-4 py-2.5 text-sm font-medium text-navy shadow-lg transition-all duration-300 sm:block",
          showLabel
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-3 opacity-0"
        )}
      >
        <span className="block text-[11px] font-700 uppercase tracking-wide text-[#1ebe57]">
          Atendimento Rápido
        </span>
        Tire sua dúvida sobre cidadania
      </a>

      {/* Button */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar via WhatsApp"
        className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform hover:scale-105 active:scale-95 sm:size-16"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-40" />
        <svg
          viewBox="0 0 32 32"
          className="size-8 sm:size-9"
          fill="currentColor"
          aria-hidden
        >
          <path d="M16.04 4c-6.62 0-12 5.38-12 12 0 2.11.55 4.16 1.6 5.98L4 28l6.18-1.62a11.93 11.93 0 0 0 5.86 1.51h.01c6.62 0 12-5.38 12-12s-5.39-11.89-12.01-11.89zm0 21.82h-.01a9.84 9.84 0 0 1-5.01-1.37l-.36-.21-3.67.96.98-3.58-.24-.37a9.83 9.83 0 0 1-1.51-5.25c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.89-9.98 9.89zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.01-1.04 2.47 1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
        </svg>
      </a>
    </div>
  );
}
