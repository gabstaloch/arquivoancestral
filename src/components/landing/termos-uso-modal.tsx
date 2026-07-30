"use client";

import { X, FileText, CheckCircle2 } from 'lucide-react';

interface TermosUsoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermosUsoModal({ isOpen, onClose }: TermosUsoModalProps) {
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
              <FileText className="size-6 text-navy" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-navy leading-tight">
                Termos de Uso e Condições de Serviço
              </h2>
              <p className="text-xs text-gold-dark font-medium mt-1">
                Arquivo Ancestral — Condições Gerais de Contratação
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
            Ao utilizar nossa plataforma e solicitar os serviços do Arquivo Ancestral, você concorda com os termos e condições abaixo:
          </p>
        </div>

        {/* Corpo do Texto */}
        <div className="px-6 py-4 space-y-5">
          
          {/* Introdução */}
          <div className="bg-gradient-to-br from-navy/[0.03] to-transparent rounded-xl p-5 border border-navy/10">
            <p className="text-sm text-gray-700 leading-relaxed">
              O <strong className="text-navy">Arquivo Ancestral</strong> presta serviços especializados de pesquisa genealógica 
              investigativa com transparência e compromisso ético. Leia atentamente nossos termos antes de solicitar qualquer serviço.
            </p>
          </div>

          {/* Seção 1 - Objeto do Serviço */}
          <div className="pl-4 border-l-2 border-blue-300">
            <h3 className="font-semibold text-navy text-base mb-2">1. Objeto do Serviço</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              O Arquivo Ancestral presta serviços especializados de pesquisa genealógica investigativa, 
              varredura de acervos paroquiais/civis e localização de registros de nascimento, casamento 
              e óbito de ancestrais europeus.
            </p>
          </div>

          {/* Seção 2 - Taxa de Análise Inicial */}
          <div className="pl-4 border-l-2 border-green-300">
            <h3 className="font-semibold text-navy text-base mb-2">2. Taxa de Análise Inicial (R$ 250,00)</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cobre as etapas operacionais de triagem, checagem de variações de grafia e elaboração 
              do relatório de viabilidade do caso. O valor refere-se ao trabalho técnico de investigação 
              prestado a partir do envio das informações.
            </p>
          </div>

          {/* Seção 3 - Taxa de Sucesso */}
          <div className="pl-4 border-l-2 border-purple-300">
            <h3 className="font-semibold text-navy text-base mb-2">3. Taxa de Sucesso (R$ 1.250,00)</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A taxa de sucesso é cobrada exclusivamente se o documento do ancestral for efetivamente 
              localizado no acervo ou órgão europeu competente.
            </p>
          </div>

          {/* Seção 4 - Prazos e Órgãos Internacionais */}
          <div className="pl-4 border-l-2 border-orange-300">
            <h3 className="font-semibold text-navy text-base mb-2">4. Prazos e Órgãos Internacionais</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Por depender do tempo de resposta de acervos estaduais, paróquias e cartórios na Europa, 
              os prazos podem variar. O Arquivo Ancestral mantém o cliente atualizado ao longo de todo 
              o processo de investigação.
            </p>
          </div>

          {/* Seção 5 - Veracidade dos Dados */}
          <div className="pl-4 border-l-2 border-pink-300">
            <h3 className="font-semibold text-navy text-base mb-2">5. Veracidade dos Dados</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              O cliente se responsabiliza pelo fornecimento de boa-fé das informações e nomes familiares 
              conhecidos no momento do preenchimento do formulário.
            </p>
          </div>

        </div>

        {/* Footer do Modal */}
        <div className="sticky bottom-0 z-10 border-t border-navy/10 bg-gray-50/95 backdrop-blur-sm p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Vigência: Janeiro 2026</span>
            </div>
            
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-navy hover:bg-navy-light text-white font-semibold rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <CheckCircle2 className="size-5" />
              Entendi e Concordo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
