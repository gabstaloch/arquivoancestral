"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Clipboard, Image as ImageIcon, Loader2, CheckCircle2, X, MousePointerClick, RefreshCw, WifiOff } from 'lucide-react';
import { processarImagemRegistro, getImageFromClipboard, DadosExtraidosOCR } from '@/lib/ocr-utils';

interface ImagePasteZoneProps {
  onDadosExtraidos: (dados: DadosExtraidosOCR) => void;
  label?: string;
  isActive?: boolean;  // Controlado pelo pai - qual zona está ativa
  onActivate?: () => void;  // Callback quando esta zona é ativada
  tipoRegistro?: string;  // Para identificação visual (nascimento, casamento, obito)
}

export default function ImagePasteZone({ 
  onDadosExtraidos, 
  label = "Colar Imagem do Registro",
  isActive = false,
  onActivate,
  tipoRegistro
}: ImagePasteZoneProps) {
  const [processando, setProcessando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [erroRede, setErroRede] = useState(false);  // Erro específico de rede
  const containerRef = useRef<HTMLDivElement>(null);

  // Listener para Ctrl+V - SÓ funciona se esta zona está ATIVA
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // SÓ processar se esta zona está ativa E há imagem no clipboard
      if (!isActive) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      let hasImage = false;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          hasImage = true;
          break;
        }
      }

      if (!hasImage) return;

      e.preventDefault();
      
      await processarImagemColada(e.clipboardData);
    };

    document.addEventListener('paste', handlePaste);
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isActive]);  // Re-cria listener quando isActive muda

  // Processar imagem colada
  const processarImagemColada = useCallback(async (clipboardData?: DataTransfer | null) => {
    setProcessando(true);
    setErro(null);
    setErroRede(false);
    setSucesso(false);

    try {
      let arquivoImagem: File | null = null;

      if (clipboardData) {
        // Encontrar imagem nos itens do clipboard
        const items = clipboardData.items;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            arquivoImagem = item.getAsFile();
            break;
          }
        }
      } else {
        // Tentar pegar da API de clipboard
        arquivoImagem = await getImageFromClipboard();
      }

      if (!arquivoImagem) {
        throw new Error('Nenhuma imagem encontrada na área de transferência. Copie uma imagem primeiro (Ctrl+C).');
      }

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(arquivoImagem);

      // Processar com OCR
      const dadosExtraidos = await processarImagemRegistro(arquivoImagem);

      console.log(`Dados extraídos (${tipoRegistro || 'registro'}):`, dadosExtraidos);

      // Verificar se houve erro no OCR mas com dados parciais
      if (dadosExtraidos.erro && !dadosExtraidos.livro && !dadosExtraidos.folha && !dadosExtraidos.termo) {
        throw new Error(dadosExtraidos.erro);
      }

      // Chamar callback com os dados
      onDadosExtraidos(dadosExtraidos);

      setSucesso(true);
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSucesso(false), 5000);

    } catch (error: unknown) {
      console.error('Erro ao processar imagem:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Falha ao processar imagem. Tente novamente.';
      
      // Detectar erros de rede/conexão
      if (
        errorMessage.includes('conexão') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('network') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Failed to execute') ||
        errorMessage.includes('importScripts') ||
        errorMessage.includes('worker') ||
        errorMessage.includes('Timeout') ||
        errorMessage.includes('baixar')
      ) {
        setErroRede(true);
      }
      
      setErro(errorMessage);
      // Manter erro visível por mais tempo para erros de rede
    } finally {
      setProcessando(false);
    }
  }, [onDadosExtraidos, tipoRegistro]);

  // Clique para ativar esta zona e/ou colar
  const handleClick = async () => {
    // Ativar esta zona
    if (onActivate) {
      onActivate();
    }
    
    // Se já está ativa, tentar pegar imagem do clipboard
    if (isActive) {
      await processarImagemColada();
    }
  };

  // Tentar novamente após erro
  const tentarNovamente = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await processarImagemColada();
  };

  // Limpar preview
  const limparImagem = () => {
    setImagemPreview(null);
    setSucesso(false);
    setErro(null);
    setErroRede(false);
  };

  // Cores baseadas no tipo de registro
  const getColors = () => {
    switch(tipoRegistro) {
      case 'nascimento':
        return {
          active: 'border-green-400 bg-green-50 ring-2 ring-green-200',
          hover: 'hover:border-green-300 hover:bg-green-50/50',
          processing: 'border-green-400 bg-green-50',
          success: 'border-green-400 bg-green-50',
          error: 'border-red-300 bg-red-50',
          idle: 'border-gray-300 bg-gray-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-700',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700'
        };
      case 'casamento':
        return {
          active: 'border-pink-400 bg-pink-50 ring-2 ring-pink-200',
          hover: 'hover:border-pink-300 hover:bg-pink-50/50',
          processing: 'border-pink-400 bg-pink-50',
          success: 'border-pink-400 bg-pink-50',
          error: 'border-red-300 bg-red-50',
          idle: 'border-gray-300 bg-gray-50',
          iconBg: 'bg-pink-100',
          iconColor: 'text-pink-600',
          textColor: 'text-pink-700',
          badgeBg: 'bg-pink-100',
          badgeText: 'text-pink-700'
        };
      case 'obito':
        return {
          active: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300',
          hover: 'hover:border-gray-400 hover:bg-gray-50/50',
          processing: 'border-gray-500 bg-gray-100',
          success: 'border-gray-500 bg-gray-100',
          error: 'border-red-300 bg-red-50',
          idle: 'border-gray-300 bg-gray-50',
          iconBg: 'bg-gray-200',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-700',
          badgeBg: 'bg-gray-200',
          badgeText: 'text-gray-700'
        };
      default:
        return {
          active: 'border-navy/60 bg-navy/5 ring-2 ring-navy/20',
          hover: 'hover:border-navy/40 hover:bg-navy/5',
          processing: 'border-blue-300 bg-blue-50',
          success: 'border-green-300 bg-green-50',
          error: 'border-red-300 bg-red-50',
          idle: 'border-gray-300 bg-gray-50',
          iconBg: 'bg-navy/10',
          iconColor: 'text-navy/60',
          textColor: 'text-navy/70',
          badgeBg: 'bg-navy/10',
          badgeText: 'text-navy/70'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      ref={containerRef}
      className={`
        relative border-2 border-dashed rounded-lg p-3 transition-all cursor-pointer
        ${processando ? colors.processing :
          sucesso ? colors.success :
          erro ? colors.error :
          isActive ? colors.active :
          `${colors.idle} ${colors.hover}`}
      `}
      onClick={handleClick}
    >
      {/* Indicador de Zona Ativa */}
      {isActive && !processando && !imagemPreview && !erro && (
        <div className="absolute -top-2.5 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white shadow-sm border z-10">
          <MousePointerClick className="size-3 text-navy" />
          <span className={colors.badgeText}>Ativo - Pressione Ctrl+V</span>
        </div>
      )}

      {/* Conteúdo padrão */}
      {!imagemPreview && !processando && !erro && (
        <div className="flex flex-col items-center gap-2 py-3">
          <div className={`
            size-10 rounded-full flex items-center justify-center transition-colors
            ${sucesso ? 'bg-green-100' : erro ? 'bg-red-100' : colors.iconBg}
          `}>
            {sucesso ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : erro ? (
              <X className="size-5 text-red-500" />
            ) : (
              <Clipboard className={`size-5 ${isActive ? colors.iconColor : 'text-navy/60'}`} />
            )}
          </div>
          
          <div className="text-center">
            <p className={`text-sm font-medium ${
              sucesso ? 'text-green-700' : 
              erro ? 'text-red-600' : 
              isActive ? colors.textColor : 'text-navy/70'
            }`}>
              {sucesso ? 'Dados Extraídos com Sucesso!' : 
               erro || (isActive ? 'Pronto para colar (Ctrl+V)' : label)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? 'Cole a imagem agora...' : 'Clique para ativar, depois Ctrl+V'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ImageIcon className="size-3" />
            <span>Extrai: Cartório, Livro, Folha, Termo</span>
          </div>

          {/* Indicador visual de tipo */}
          {tipoRegistro && isActive && (
            <div className={`text-[9px] px-2 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText} uppercase tracking-wider`}>
              Registro: {tipoRegistro === 'nascimento' ? 'Nascimento' : 
                       tipoRegistro === 'casamento' ? 'Casamento' : 'Óbito'}
            </div>
          )}
        </div>
      )}

      {/* Estado de processamento */}
      {processando && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className={`size-8 ${colors.iconColor} animate-spin`} />
          <p className={`text-sm font-medium ${colors.textColor}`}>Processando imagem...</p>
          <p className="text-xs text-muted-foreground">Extraindo dados com OCR</p>
          <p className="text-[10px] text-muted-foreground">Isso pode levar alguns segundos...</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div className={`${colors.iconColor.replace('text-', 'bg-')} h-1.5 rounded-full animate-pulse`} style={{width: '60%'}} />
          </div>
        </div>
      )}

      {/* Preview da imagem + Sucesso */}
      {imagemPreview && !processando && !erro && (
        <div className="relative">
          <img 
            src={imagemPreview} 
            alt="Imagem do registro processada" 
            className="max-h-32 rounded-md mx-auto object-contain"
          />
          
          {/* Botão de limpar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              limparImagem();
            }}
            className="absolute -top-2 -right-2 size-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="size-4 text-gray-500" />
          </button>

          {/* Badge de sucesso */}
          {sucesso && (
            <div className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              OCR OK
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro - Melhorada */}
      {erro && !processando && (
        <div className="py-3">
          <div className="flex items-start gap-2 mb-2">
            {erroRede ? (
              <WifiOff className="size-5 text-orange-500 shrink-0 mt-0.5" />
            ) : (
              <X className="size-5 text-red-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-600">
                {erroRede ? 'Erro de Conexão / OCR' : 'Erro ao Processar'}
              </p>
              <p className="text-[11px] text-red-500 mt-1 whitespace-pre-line">
                {erro.length > 150 ? erro.substring(0, 150) + '...' : erro}
              </p>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-2 mt-3 justify-center">
            <button
              type="button"
              onClick={tentarNovamente}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-navy text-white hover:bg-navy-light transition-colors"
            >
              <RefreshCw className="size-3" />
              Tentar Novamente
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                limparImagem();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Limpar
            </button>
          </div>

          {/* Dica para erros de rede */}
          {erroRede && (
            <div className="mt-3 p-2 bg-orange-50 rounded-md border border-orange-200">
              <p className="text-[10px] text-orange-700 font-medium">💡 Dicas:</p>
              <ul className="text-[10px] text-orange-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>Verifique sua conexão com a internet</li>
                <li>Tente recarregar a página (F5)</li>
                <li>Se persistir, preencha os campos manualmente</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
