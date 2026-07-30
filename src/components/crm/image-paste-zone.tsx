"use client";

import { useState, useEffect, useCallback } from 'react';
import { Clipboard, CheckCircle2, X, MousePointerClick, Type, Zap } from 'lucide-react';
import { DadosExtraidosOCR, parsearTextoColado } from '@/lib/ocr-utils';

interface MatriculaPasteZoneProps {
  onDadosExtraidos: (dados: DadosExtraidosOCR) => void;
  isActive?: boolean;
  onActivate?: () => void;
  tipoRegistro?: string;
}

export default function MatriculaPasteZone({ 
  onDadosExtraidos, 
  isActive = false,
  onActivate,
  tipoRegistro
}: MatriculaPasteZoneProps) {
  const [matriculaInput, setMatriculaInput] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dadosExtraidos, setDadosExtraidos] = useState<DadosExtraidosOCR | null>(null);

  // Listener para Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive) return;
      
      const texto = e.clipboardData?.getData('text');
      if (texto && /\d/.test(texto)) {
        e.preventDefault();
        processarMatricula(texto);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isActive]);

  // Processar matrícula (colada ou digitada)
  const processarMatricula = useCallback((texto: string) => {
    console.log('📝 Processando matrícula:', texto);
    
    // Limpar e validar
    const textoLimpo = texto.trim();
    if (!textoLimpo || !/\d/.test(textoLimpo)) {
      setErro('Cole ou digite uma matrícula válida (deve conter números)');
      setSucesso(false);
      return;
    }

    // Parsear a matrícula
    const dados = parsearTextoColado(`MATRÍCULA: ${textoLimpo}`);
    
    console.log('✅ Dados extraídos:', dados);
    
    // Verificar se extraiu algo útil
    const temDados = dados.livro || dados.folha || dados.termo;
    
    if (!temDados) {
      setErro('Não foi possível identificar os campos. Verifique o formato da matrícula.');
      setSucesso(false);
      return;
    }
    
    // Sucesso!
    setErro(null);
    setSucesso(true);
    setDadosExtraidos(dados);
    setMatriculaInput(textoLimpo);
    
    // Enviar dados para o pai
    onDadosExtraidos({
      ...dados,
      matriculaCompleta: textoLimpo,
      metodo: 'matricula_automatica'
    });
    
    // Limpar sucesso após 4 segundos
    setTimeout(() => setSucesso(false), 4000);
    
  }, [onDadosExtraidos]);

  // Handler para input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setMatriculaInput(valor);
    setErro(null);
    
    // Se parece uma matrícula completa (muitos números), processar automaticamente
    if (valor.length > 20 && /\d{5,}\s+\d/.test(valor)) {
      processarMatricula(valor);
    }
  };

  // Handler para Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && matriculaInput.trim()) {
      processarMatricula(matriculaInput);
    }
  };

  // Clique para ativar
  const handleClick = () => {
    if (onActivate) onActivate();
  };

  // Limpar
  const limpar = () => {
    setMatriculaInput('');
    setSucesso(false);
    setErro(null);
    setDadosExtraidos(null);
  };

  // Cores por tipo
  const getColors = () => {
    switch(tipoRegistro) {
      case 'nascimento': 
        return { 
          active: 'border-green-400 bg-green-50 ring-2 ring-green-200', 
          success: 'border-green-400 bg-green-50',
          iconColor: 'text-green-600',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-700'
        };
      case 'casamento': 
        return { 
          active: 'border-pink-400 bg-pink-50 ring-2 ring-pink-200', 
          success: 'border-pink-400 bg-pink-50',
          iconColor: 'text-pink-600',
          badgeBg: 'bg-pink-100',
          badgeText: 'text-pink-700'
        };
      case 'obito': 
        return { 
          active: 'border-gray-500 bg-gray-100 ring-2 ring-gray-300', 
          success: 'border-gray-500 bg-gray-100',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-200',
          badgeText: 'text-gray-700'
        };
      default: 
        return { 
          active: 'border-navy/60 bg-navy/5 ring-2 ring-navy/20', 
          success: 'border-navy/60 bg-navy/5',
          iconColor: 'text-navy/60',
          badgeBg: 'bg-navy/10',
          badgeText: 'text-navy/70'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className={`
        relative border-2 rounded-lg p-3 transition-all cursor-pointer
        ${sucesso ? colors.success :
          erro ? 'border-red-300 bg-red-50' :
          isActive ? colors.active :
          'border-gray-300 bg-white hover:border-navy/40 hover:bg-navy/5'}
      `}
      onClick={handleClick}
    >
      {/* Badge Ativo */}
      {isActive && !sucesso && (
        <div className="absolute -top-2.5 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white shadow-sm border z-10">
          <MousePointerClick className="size-3 text-navy" />
          <span className={colors.badgeText}>Ativo - Cole aqui (Ctrl+V)</span>
        </div>
      )}

      {/* Badge de Sucesso */}
      {sucesso && (
        <div className="absolute -top-2.5 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500 text-white shadow-sm z-10">
          <CheckCircle2 className="size-3" />
          <span>Dados Extraídos!</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className={`size-8 rounded-lg flex items-center justify-center ${sucesso ? 'bg-green-100' : erro ? 'bg-red-100' : colors.iconBg.replace('bg-', 'bg-')}`}>
            {sucesso ? (
              <CheckCircle2 className={`size-4 text-green-600`} />
            ) : (
              <Type className={`size-4 ${isActive ? colors.iconColor : 'text-gray-500'}`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${sucesso ? 'text-green-700' : erro ? 'text-red-600' : 'text-navy'}`}>
              {sucesso ? 'Matrícula processada com sucesso!' : 
               erro || 'Cole a Matrícula do Registro'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {sucesso ? 'Os campos foram preenchidos automaticamente' :
               'Pressione Ctrl+V ou digite a matrícula completa'}
            </p>
          </div>

          {(matriculaInput || sucesso) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); limpar(); }}
              className="size-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Input da Matrícula */}
        <div className="relative">
          <input
            type="text"
            value={matriculaInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="107300 01 55 2005 1 00036 020 0018665 19"
            className={`
              w-full px-3 py-2.5 pr-10 text-sm font-mono border rounded-lg
              focus:outline-none focus:ring-2 transition-colors
              ${sucesso ? 'border-green-300 bg-green-50 focus:ring-green-200' :
                erro ? 'border-red-300 bg-red-50 focus:ring-red-200' :
                'border-gray-200 focus:ring-navy/30 focus:border-navy/40'}
            `}
            onClick={(e) => e.stopPropagation()}
          />
          
          <Zap className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 ${sucesso ? 'text-green-500' : 'text-gray-300'}`} />
        </div>

        {/* Erro */}
        {erro && (
          <p className="text-xs text-red-600 flex items-start gap-1">
            <X className="size-3 mt-0.5 shrink-0" />
            {erro}
          </p>
        )}

        {/* Dados Extraídos (quando sucesso) */}
        {sucesso && dadosExtraidos && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-current/10">
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Livro</p>
              <p className="text-sm font-bold text-navy">{dadosExtraidos.livro || '-'}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Folha</p>
              <p className="text-sm font-bold text-navy">{dadosExtraidos.folha || '-'}</p>
            </div>
            <div className="text-center p-2 bg-white rounded-md">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Termo</p>
              <p className="text-sm font-bold text-navy">{dadosExtraidos.termo || '-'}</p>
            </div>
          </div>
        )}

        {/* Ajuda */}
        {!sucesso && !erro && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-gray-50 rounded px-2 py-1.5">
            <Clipboard className="size-3 shrink-0" />
            <span>Copie a matrícula do documento e cole aqui (Ctrl+V)</span>
          </div>
        )}
      </div>
    </div>
  );
}
