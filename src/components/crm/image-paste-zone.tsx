"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Clipboard, Image as ImageIcon, Loader2, CheckCircle2, X, MousePointerClick, RefreshCw, AlertTriangle } from 'lucide-react';
import { processarImagemRegistro, getImageFromClipboard, DadosExtraidosOCR } from '@/lib/ocr-utils';

interface ImagePasteZoneProps {
  onDadosExtraidos: (dados: DadosExtraidosOCR) => void;
  label?: string;
  isActive?: boolean;
  onActivate?: () => void;
  tipoRegistro?: string;
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
  const [aviso, setAviso] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listener para Ctrl+V - SÓ funciona se esta zona está ATIVA
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
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
  }, [isActive]);

  // Processar imagem colada
  const processarImagemColada = useCallback(async (clipboardData?: DataTransfer | null) => {
    setProcessando(true);
    setErro(null);
    setAviso(null);
    setSucesso(false);

    try {
      let arquivoImagem: File | null = null;

      if (clipboardData) {
        const items = clipboardData.items;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            arquivoImagem = item.getAsFile();
            break;
          }
        }
      } else {
        arquivoImagem = await getImageFromClipboard();
      }

      if (!arquivoImagem) {
        setErro('Nenhuma imagem encontrada. Copie uma imagem primeiro (Ctrl+C).');
        return;
      }

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(arquivoImagem);

      // Processar com OCR
      console.log(`🔄 Iniciando OCR para ${tipoRegistro || 'registro'}...`);
      const dadosExtraidos = await processarImagemRegistro(arquivoImagem);

      console.log(`✅ Resultado OCR (${tipoRegistro}):`, dadosExtraidos);

      // Verificar resultado
      if (dadosExtraidos.erro && !dadosExtraidos.livro && !dadosExtraidos.folha && !dadosExtraidos.termo) {
        // Erro crítico - não extraiu nada útil
        setErro(dadosExtraidos.erro);
        if (dadosExtraidos.aviso) {
          setAviso(dadosExtraidos.aviso);
        }
        return;  // Não chamar callback, mostrar erro
      }

      // Sucesso parcial ou total - sempre enviar dados
      if (dadosExtraidos.erro) {
        setAviso(dadosExtraidos.erro);  // Mostrar como aviso, não erro
      }
      if (dadosExtraidos.aviso) {
        setAviso(prev => prev ? prev + '\n' + dadosExtraidos.aviso : dadosExtraidos.aviso);
      }

      // Chamar callback com os dados extraídos (mesmo que parciais)
      onDadosExtraidos(dadosExtraidos);

      // Marcar como sucesso se tiver pelo menos alguns dados
      const temDadosUteis = dadosExtraidos.livro || dadosExtraidos.folha || 
                           dadosExtraidos.termo || dadosExtraidos.cartorio;
      if (temDadosUteis) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 5000);
      }

    } catch (error: unknown) {
      console.error('❌ Erro inesperado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErro(`Erro inesperado: ${errorMessage}`);
    } finally {
      setProcessando(false);
    }
  }, [onDadosExtraidos, tipoRegistro]);

  // Clique para ativar esta zona e/ou colar
  const handleClick = async () => {
    if (onActivate) {
      onActivate();
    }
    
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
    setAviso(null);
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
              {sucesso ? 'Dados Extraídos!' : 
               erro || (isActive ? 'Pronto! Ctrl+V para colar' : label)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? 'Cole a imagem do registro agora...' : 'Clique aqui para ativar'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ImageIcon className="size-3" />
            <span>Extrai: Cartório, Livro, Folha, Termo</span>
          </div>

          {tipoRegistro && isActive && (
            <div className={`text-[9px] px-2 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText} uppercase tracking-wider`}>
              {tipoRegistro === 'nascimento' ? 'Nascimento' : 
               tipoRegistro === 'casamento' ? 'Casamento' : 'Óbito'}
            </div>
          )}
        </div>
      )}

      {/* Estado de processamento */}
      {processando && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className={`size-8 ${colors.iconColor} animate-spin`} />
          <p className={`text-sm font-medium ${colors.textColor}`}>Processando...</p>
          <p className="text-xs text-muted-foreground">Extraindo texto com OCR</p>
          <p className="text-[10px] text-muted-foreground">⏱️ Pode levar 10-30 segundos</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className={`${colors.iconColor.replace('text-', 'bg-')} h-full animate-pulse`} style={{width: '70%'}} />
          </div>
        </div>
      )}

      {/* Preview + Sucesso */}
      {imagemPreview && !processando && !erro && (
        <div className="relative">
          <img 
            src={imagemPreview} 
            alt="Imagem processada" 
            className="max-h-32 rounded-md mx-auto object-contain"
          />
          
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

          {sucesso && (
            <div className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              OK
            </div>
          )}

          {aviso && !sucesso && (
            <div className="absolute -top-2 -left-2 bg-yellow-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 max-w-[150px] truncate">
              <AlertTriangle className="size-3" />
              Parcial
            </div>
          )}
        </div>
      )}

      {/* Aviso (amarelo - não é erro crítico) */}
      {aviso && !erro && !processando && (
        <div className="py-2 px-2 bg-yellow-50 rounded-md border border-yellow-200 mt-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-yellow-800">Aviso</p>
              <p className="text-[11px] text-yellow-700 mt-0.5">{aviso}</p>
            </div>
          </div>
        </div>
      )}

      {/* Erro (vermelho) */}
      {erro && !processando && (
        <div className="py-3">
          <div className="flex items-start gap-2 mb-3">
            <X className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-600">Erro ao Processar</p>
              <p className="text-[11px] text-red-500 mt-1">{erro}</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
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

          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-[10px] text-blue-700 font-medium">💡 Alternativa:</p>
            <p className="text-[10px] text-blue-600 mt-1">
              Se o OCR continuar falhando, você pode preencher os campos manualmente abaixo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
