"use client";

import { useState, useRef, useEffect } from 'react';
import { Clipboard, Image as ImageIcon, Loader2, CheckCircle2, X } from 'lucide-react';
import { processarImagemRegistro, getImageFromClipboard, DadosExtraidosOCR } from '@/lib/ocr-utils';

interface ImagePasteZoneProps {
  onDadosExtraidos: (dados: DadosExtraidosOCR) => void;
  label?: string;
}

export default function ImagePasteZone({ onDadosExtraidos, label = "Colar Imagem do Registro" }: ImagePasteZoneProps) {
  const [processando, setProcessando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listener para Ctrl+V
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Verificar se o foco está dentro do container ou se é uma imagem
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
  }, []);

  // Processar imagem colada
  const processarImagemColada = async (clipboardData: DataTransfer) => {
    setProcessando(true);
    setErro(null);
    setSucesso(false);

    try {
      // Encontrar imagem nos itens
      const items = clipboardData.items;
      let arquivoImagem: File | null = null;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          arquivoImagem = item.getAsFile();
          break;
        }
      }

      if (!arquivoImagem) {
        throw new Error('Nenhuma imagem encontrada na área de transferência');
      }

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(arquivoImagem);

      // Processar com OCR
      const dadosExtraidos = await processarImagemRegistro(arquivoImagem);

      console.log('Dados extraídos:', dadosExtraidos);

      // Chamar callback com os dados
      onDadosExtraidos(dadosExtraidos);

      setSucesso(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSucesso(false), 3000);

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao processar imagem');
    } finally {
      setProcessando(false);
    }
  };

  // Também permitir clique para colar (alternativa)
  const handleClick = async () => {
    try {
      const arquivo = await getImageFromClipboard();
      if (arquivo) {
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        
        const fakeEvent = {
          clipboardData: dt,
          preventDefault: () => {},
        } as ClipboardEvent;
        
        await processarImagemColada(fakeEvent.clipboardData!);
      } else {
        setErro('Nenhuma imagem encontrada. Use Ctrl+V para colar.');
        setTimeout(() => setErro(null), 3000);
      }
    } catch (error) {
      setErro('Não foi possível acessar a área de transferência.');
      setTimeout(() => setErro(null), 3000);
    }
  };

  // Limpar preview
  const limparImagem = () => {
    setImagemPreview(null);
    setSucesso(false);
    setErro(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`
        relative border-2 border-dashed rounded-lg p-3 transition-all cursor-pointer
        ${processando ? 'border-blue-300 bg-blue-50' :
          sucesso ? 'border-green-300 bg-green-50' :
          erro ? 'border-red-300 bg-red-50' :
          'border-gray-300 bg-gray-50 hover:border-navy/40 hover:bg-navy/5'}
      `}
      onClick={handleClick}
    >
      {/* Conteúdo padrão */}
      {!imagemPreview && !processando && (
        <div className="flex flex-col items-center gap-2 py-3">
          <div className={`
            size-10 rounded-full flex items-center justify-center
            ${sucesso ? 'bg-green-100' : erro ? 'bg-red-100' : 'bg-navy/10'}
          `}>
            {sucesso ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : erro ? (
              <X className="size-5 text-red-500" />
            ) : (
              <Clipboard className="size-5 text-navy/60" />
            )}
          </div>
          
          <div className="text-center">
            <p className={`text-sm font-medium ${
              sucesso ? 'text-green-700' : erro ? 'text-red-600' : 'text-navy/70'
            }`}>
              {sucesso ? 'Dados Extraídos com Sucesso!' : 
               erro || label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pressione Ctrl+V ou clique aqui
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ImageIcon className="size-3" />
            <span>Extrai: Cartório, Livro, Folha, Termo</span>
          </div>
        </div>
      )}

      {/* Estado de processamento */}
      {processando && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-blue-700">Processando imagem...</p>
          <p className="text-xs text-muted-foreground">Extraindo dados com OCR</p>
        </div>
      )}

      {/* Preview da imagem + Sucesso */}
      {imagemPreview && !processando && (
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

      {/* Mensagem de erro */}
      {erro && (
        <p className="text-xs text-red-600 mt-2 text-center">{erro}</p>
      )}
    </div>
  );
}
