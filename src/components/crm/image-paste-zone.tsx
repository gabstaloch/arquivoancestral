"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Clipboard, Image as ImageIcon, Loader2, CheckCircle2, X, 
  MousePointerClick, FileText, Type, Eye, Edit3 
} from 'lucide-react';
import { processarImagemRegistro, getImageFromClipboard, DadosExtraidosOCR, parsearTextoColado } from '@/lib/ocr-utils';

interface ImagePasteZoneProps {
  onDadosExtraidos: (dados: DadosExtraidosOCR) => void;
  label?: string;
  isActive?: boolean;
  onActivate?: () => void;
  tipoRegistro?: string;
}

export default function ImagePasteZone({ 
  onDadosExtraidos, 
  label = "Adicionar Registro",
  isActive = false,
  onActivate,
  tipoRegistro
}: ImagePasteZoneProps) {
  const [processando, setProcessando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);  // Modo de edição manual
  const [matriculaInput, setMatriculaInput] = useState('');  // Input para colar matrícula
  
  // Campos editáveis para preenchimento assistido
  const [camposEditaveis, setCamposEditaveis] = useState({
    cartorio: '',
    livro: '',
    folha: '',
    termo: ''
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Listener para Ctrl+V
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isActive) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      // Verificar se é imagem
      let hasImage = false;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          hasImage = true;
          break;
        }
      }

      if (hasImage) {
        e.preventDefault();
        await processarImagemColada(e.clipboardData);
        return;
      }
      
      // Se não é imagem, verificar se é texto (matrícula colada)
      const texto = e.clipboardData?.getData('text');
      if (texto && /\d/.test(texto)) {
        e.preventDefault();
        processarTextoColado(texto);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isActive]);

  // Processar imagem colada
  const processarImagemColada = useCallback(async (clipboardData?: DataTransfer | null) => {
    setProcessando(true);
    setErro(null);
    setSucesso(false);

    try {
      let arquivoImagem: File | null = null;

      if (clipboardData) {
        for (const item of Array.from(clipboardData.items)) {
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

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => setImagemPreview(e.target?.result as string);
      reader.readAsDataURL(arquivoImagem);

      // Processar (sem OCR - modo assistido)
      const dados = await processarImagemRegistro(arquivoImagem);
      
      console.log('📋 Dados recebidos:', dados);
      
      // Entrar em modo de edição assistida
      setModoEdicao(true);
      
      // Preencher campos se houver dados
      if (dados.cartorio) setCamposEditaveis(prev => ({...prev, cartorio: dados.cartorio || ''}));
      if (dados.livro) setCamposEditaveis(prev => ({...prev, livro: dados.livro || ''}));
      if (dados.folha) setCamposEditaveis(prev => ({...prev, folha: dados.folha || ''}));
      if (dados.termo) setCamposEditaveis(prev => ({...prev, termo: dados.termo || ''}));

      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);

    } catch (error: unknown) {
      console.error('Erro:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao processar');
    } finally {
      setProcessando(false);
    }
  }, []);

  // Processar texto/matrícula colada
  const processarTextoColado = useCallback((texto: string) => {
    console.log('📝 Texto colado:', texto.substring(0, 100));
    
    const dados = parsearTextoColado(texto);
    console.log('✅ Dados extraídos do texto:', dados);
    
    // Atualizar campos editáveis
    if (dados.livro) setCamposEditaveis(prev => ({...prev, livro: dados.livro || ''}));
    if (dados.folha) setCamposEditaveis(prev => ({...prev, folha: dados.folha || ''}));
    if (dados.termo) setCamposEditaveis(prev => ({...prev, termo: dados.termo || ''}));
    if (dados.cartorio) setCamposEditaveis(prev => ({...prev, cartorio: dados.cartorio || ''}));
    
    // Guardar no input de matrícula também
    if (dados.matriculaCompleta) {
      setMatriculaInput(dados.matriculaCompleta);
    }
    
    // Enviar dados
    onDadosExtraidos(dados);
    setSucesso(true);
    setModoEdicao(true);
    setTimeout(() => setSucesso(false), 3000);
  }, [onDadosExtraidos]);

  // Processar matrícula do input
  const processarMatriculaInput = useCallback(() => {
    if (!matriculaInput.trim()) return;
    
    const dados = parsearTextoColado(`MATRÍCULA: ${matriculaInput}`);
    
    // Atualizar campos
    setCamposEditaveis({
      cartorio: dados.cartorio || camposEditaveis.cartorio,
      livro: dados.livro || '',
      folha: dados.folha || '',
      termo: dados.termo || ''
    });
    
    // Enviar dados
    onDadosExtraidos({
      ...dados,
      matriculaCompleta: matriculaInput.trim()
    });
    
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  }, [matriculaInput, camposEditaveis.cartorio, onDadosExtraidos]);

  // Clique para ativar
  const handleClick = async () => {
    if (onActivate) onActivate();
    if (isActive) await processarImagemColada();
  };

  // Salvar campos editados
  const salvarCamposEditados = () => {
    const dados: DadosExtraidosOCR = {
      tipoRegistro: tipoRegistro as any,
      cartorio: camposEditaveis.cartorio || undefined,
      livro: camposEditaveis.livro || undefined,
      folha: camposEditaveis.folha || undefined,
      termo: camposEditaveis.termo || undefined,
      metodo: 'manual_assistido'
    };
    
    console.log('💾 Salvando campos:', dados);
    onDadosExtraidos(dados);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  };

  // Limpar tudo
  const limparTudo = () => {
    setImagemPreview(null);
    setSucesso(false);
    setErro(null);
    setModoEdicao(false);
    setMatriculaInput('');
    setCamposEditaveis({ cartorio: '', livro: '', folha: '', termo: '' });
  };

  // Cores por tipo
  const getColors = () => {
    switch(tipoRegistro) {
      case 'nascimento': return { active: 'border-green-400 bg-green-50 ring-2 ring-green-200', iconColor: 'text-green-600', iconBg: 'bg-green-100' };
      case 'casamento': return { active: 'border-pink-400 bg-pink-50 ring-2 ring-pink-200', iconColor: 'text-pink-600', iconBg: 'bg-pink-100' };
      case 'obito': return { active: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300', iconColor: 'text-gray-600', iconBg: 'bg-gray-200' };
      default: return { active: 'border-navy/60 bg-navy/5 ring-2 ring-navy/20', iconColor: 'text-navy/60', iconBg: 'bg-navy/10' };
    }
  };

  const colors = getColors();

  return (
    <div 
      ref={containerRef}
      className={`
        relative border-2 border-dashed rounded-lg p-3 transition-all cursor-pointer
        ${processando ? 'border-blue-300 bg-blue-50' :
          sucesso ? 'border-green-300 bg-green-50' :
          erro ? 'border-red-300 bg-red-50' :
          isActive ? colors.active :
          'border-gray-300 bg-gray-50 hover:border-navy/40 hover:bg-navy/5'}
      `}
      onClick={handleClick}
    >
      {/* Badge Ativo */}
      {isActive && !imagemPreview && !modoEdicao && (
        <div className="absolute -top-2.5 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white shadow-sm border z-10">
          <MousePointerClick className="size-3 text-navy" />
          <span className="text-navy">Ativo - Ctrl+V</span>
        </div>
      )}

      {/* Estado inicial */}
      {!imagemPreview && !modoEdicao && !processando && !erro && (
        <div className="flex flex-col items-center gap-2 py-3">
          <div className={`size-10 rounded-full flex items-center justify-center ${colors.iconBg}`}>
            <Clipboard className={`size-5 ${isActive ? colors.iconColor : 'text-navy/60'}`} />
          </div>
          
          <div className="text-center">
            <p className={`text-sm font-medium ${isActive ? 'text-navy' : 'text-navy/70'}`}>
              {isActive ? 'Pronto! Cole a imagem ou matrícula (Ctrl+V)' : label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? 'Aceita imagem OU texto com números' : 'Clique para ativar'}
            </p>
          </div>

          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><ImageIcon className="size-3" /> Imagem</span>
            <span className="flex items-center gap-1"><Type className="size-3" /> Matrícula</span>
          </div>
        </div>
      )}

      {/* Processando */}
      {processando && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-blue-700">Recebendo imagem...</p>
        </div>
      )}

      {/* Erro */}
      {erro && !processando && (
        <div className="py-3">
          <p className="text-xs text-red-600 text-center mb-2">{erro}</p>
          <button onClick={() => setErro(null)} className="text-xs text-blue-600 mx-auto block">Tentar novamente</button>
        </div>
      )}

      {/* Modo Edição Assistida - Com Imagem */}
      {(imagemPreview || modoEdicao) && !processando && (
        <div className="space-y-3">
          {/* Preview da imagem */}
          {imagemPreview && (
            <div className="relative">
              <img src={imagemPreview} alt="Registro" className="max-h-28 rounded-md mx-auto object-contain border" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImagemPreview(null); }}
                className="absolute -top-2 -right-2 size-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
              >
                <X className="size-4 text-gray-500" />
              </button>
              
              {sucesso && (
                <div className="absolute -top-2 -left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> OK
                </div>
              )}
            </div>
          )}

          {/* Header do modo edição */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Edit3 className="size-4 text-navy" />
              <span className="text-xs font-semibold text-navy">Preenchimento Assistido</span>
            </div>
            {sucesso && (
              <CheckCircle2 className="size-4 text-green-500" />
            )}
          </div>

          {/* Input rápido para colar MATRÍCULA completa */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Type className="size-3" />
              Cole a Matrícula aqui (Ctrl+V) ou digite:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={matriculaInput}
                onChange={(e) => setMatriculaInput(e.target.value)}
                placeholder="Ex: 107300 01 55 2005 1 00036 020 0018665"
                className="flex-1 px-2 py-1.5 text-xs border rounded font-mono focus:outline-none focus:ring-2 focus:ring-navy/30"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); processarMatriculaInput(); }}
                disabled={!matriculaInput.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-navy text-white rounded hover:bg-navy-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Extrair
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground">
              O sistema vai separar automaticamente: Livro, Folha, Termo
            </p>
          </div>

          {/* Campos individuais */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Cartório</label>
              <input
                type="text"
                value={camposEditaveis.cartorio}
                onChange={(e) => setCamposEditaveis(p => ({...p, cartorio: e.target.value}))}
                placeholder="Nome do cartório"
                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-navy/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Livro</label>
              <input
                type="text"
                value={camposEditaveis.livro}
                onChange={(e) => setCamposEditaveis(p => ({...p, livro: e.target.value}))}
                placeholder="Nº do livro"
                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-navy/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Folha</label>
              <input
                type="text"
                value={camposEditaveis.folha}
                onChange={(e) => setCamposEditaveis(p => ({...p, folha: e.target.value}))}
                placeholder="Nº da folha"
                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-navy/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Termo</label>
              <input
                type="text"
                value={camposEditaveis.termo}
                onChange={(e) => setCamposEditaveis(p => ({...p, termo: e.target.value}))}
                placeholder="Nº do termo"
                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-navy/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); salvarCamposEditados(); }}
            className="w-full py-2 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="size-4" />
            Salvar Dados do Registro
          </button>

          {/* Limpar */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); limparTudo(); }}
            className="w-full py-1.5 text-[10px] text-muted-foreground hover:text-gray-600"
          >
            Limpar tudo e recomeçar
          </button>
        </div>
      )}
    </div>
  );
}
