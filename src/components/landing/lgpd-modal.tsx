"use client";

import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LGPDModal({ isOpen, onClose }: LGPDModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay escurecido */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-navy/10 bg-white/95 backdrop-blur-sm p-6 pb-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6 text-navy" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-navy leading-tight">
                Política de Privacidade e Proteção de Dados (LGPD)
              </h2>
              <p className="text-xs text-gold-dark font-medium mt-1">
                Arquivo Ancestral — Conformidade com a Lei nº 13.709/2018
              </p>
            </div>
          </div>
          
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        {/* Subtítulo */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm text-gray-600 italic border-l-3 border-gold pl-4 py-2 bg-gold/5 rounded-r-lg">
            Como cuidamos das suas informações e dos dados da sua história familiar.
          </p>
        </div>

        {/* Corpo do Texto */}
        <div className="px-6 py-4 space-y-6">
          
          {/* Introdução */}
          <div className="bg-gradient-to-br from-navy/[0.03] to-transparent rounded-xl p-5 border border-navy/10">
            <p className="text-sm text-gray-700 leading-relaxed">
              No <strong className="text-navy">Arquivo Ancestral</strong>, levamos a sua privacidade e a segurança dos seus dados a sério. 
              Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>, 
              explicamos abaixo como tratamos suas informações:
            </p>
          </div>

          {/* Seção 1 - Coleta de Dados */}
          <div className="pl-4 border-l-2 border-green-200">
            <h3 className="font-semibold text-navy text-base mb-2">1. Coleta de Dados</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Coletamos apenas as informações necessárias para a prestação dos nossos serviços de pesquisa genealógica 
              (como seu nome, e-mail, telefone/WhatsApp e os dados da sua linhagem familiar fornecidos no formulário).
            </p>
          </div>

          {/* Seção 2 - Uso das Informações */}
          <div className="pl-4 border-l-2 border-blue-200">
            <h3 className="font-semibold text-navy text-base mb-2">2. Uso das Informações</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Seus dados são utilizados exclusivamente para efetuar as buscas de certidões nos acervos e cartórios 
              (nacionais e internacionais), bem como para manter a comunicação direta sobre o andamento do seu pedido.
            </p>
          </div>

          {/* Seção 3 - Compartilhamento Restrito */}
          <div className="pl-4 border-l-2 border-purple-200">
            <h3 className="font-semibold text-navy text-base mb-2">3. Compartilhamento Restrito</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais. 
              Os dados da árvore genealógica são informados apenas aos órgãos, arquivos históricos, paróquias e cartórios 
              estritamente necessários para a localização e emissão dos documentos.
            </p>
          </div>

          {/* Seção 4 - Armazenamento e Segurança */}
          <div className="pl-4 border-l-2 border-orange-200">
            <h3 className="font-semibold text-navy text-base mb-2">4. Armazenamento e Segurança</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Seus dados são mantidos em ambiente seguro e restrito apenas aos pesquisadores responsáveis pela investigação do seu caso.
            </p>
          </div>

          {/* Seção 5 - Seus Direitos */}
          <div className="pl-4 border-l-2 border-pink-200">
            <h3 className="font-semibold text-navy text-base mb-2">5. Seus Direitos</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Você pode, a qualquer momento, solicitar a confirmação, atualização ou exclusão definitiva dos seus dados pessoais 
              do nosso banco de dados entrando em contato direto via WhatsApp ou e-mail.
            </p>
          </div>

        </div>

        {/* Footer do Modal */}
        <div className="sticky bottom-0 z-10 border-t border-navy/10 bg-gray-50/95 backdrop-blur-sm p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Última atualização: Janeiro 2026</span>
            </div>
            
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-navy hover:bg-navy-light text-white font-semibold rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <CheckCircle2 className="size-5" />
              Entendi / Ciente
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
