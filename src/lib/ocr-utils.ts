// OCR Utilities for Brazilian Civil Registry Documents
// Extracts: Cartório, Livro, Folha, Termo from pasted images
// V2: Uses local Tesseract files to avoid CDN issues

export interface DadosExtraidosOCR {
  tipoRegistro?: 'nascimento' | 'casamento' | 'obito';
  cartorio?: string;
  municipio?: string;
  uf?: string;
  livro?: string;
  folha?: string;
  termo?: string;
  matriculaCompleta?: string;
  dataRegistro?: string;
  nomeRegistrado?: string;
  rawText?: string;
  erro?: string;
  aviso?: string;  // Aviso não crítico
}

// Estado global para controlar inicialização do worker
let tesseractWorker: any = null;
let tesseractInitializing = false;
let tesseractError: string | null = null;

/**
 * Inicializa o worker do Tesseract uma única vez
 */
async function getTesseractWorker(): Promise<any> {
  // Se já tem worker pronto, retornar
  if (tesseractWorker) return tesseractWorker;
  
  // Se houve erro anterior, não tentar novamente na mesma sessão
  if (tesseractError) throw new Error(tesseractError);
  
  // Se já está inicializando, esperar
  if (tesseractInitializing) {
    // Esperar até 10 segundos pela inicialização
    for (let i = 0; i < 100; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (tesseractWorker) return tesseractWorker;
      if (tesseractError) throw new Error(tesseractError);
    }
    throw new Error('Timeout ao inicializar OCR');
  }
  
  tesseractInitializing = true;
  
  try {
    console.log('🔍 Inicializando Tesseract OCR...');
    
    // Import dinâmico
    const Tesseract = (await import('tesseract.js')).default;
    
    // Criar worker com configuração local
    const worker = await Tesseract.createWorker('por', 1, {
      logger: (m: any) => {
        if (m.status === 'loading language data' || m.status === 'initializing tesseract') {
          console.log(`OCR Init: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`);
        }
      },
      // Tentar usar caminho relativo primeiro, depois CDN como fallback
      workerPath: '/tesseract/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
      corePath: undefined,
    });
    
    tesseractWorker = worker;
    tesseractInitializing = false;
    console.log('✅ Tesseract OCR inicializado com sucesso!');
    
    return worker;
    
  } catch (error: unknown) {
    tesseractInitializing = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    tesseractError = `OCR não disponível: ${errorMessage}`;
    console.error('❌ Erro ao inicializar Tesseract:', errorMessage);
    throw new Error(tesseractError);
  }
}

/**
 * Processa uma imagem usando OCR para extrair dados do registro civil
 */
export async function processarImagemRegistro(file: File | Blob): Promise<DadosExtraidosOCR> {
  const TIMEOUT_MS = 45000; // 45 segundos timeout
  
  try {
    console.log('📷 Processando imagem para OCR...');
    
    // Obter worker (inicializa se necessário)
    const worker = await getTesseractWorker();
    
    // Criar promise com timeout
    const recognitionPromise = worker.recognize(file);
    
    const result = await Promise.race([
      recognitionPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: O processamento da imagem demorou muito. Tente uma imagem menor ou verifique sua conexão.')), TIMEOUT_MS)
      )
    ]);
    
    const texto = result.data.text;
    console.log('📝 Texto extraído pelo OCR:', texto?.substring(0, 200) + '...');

    if (!texto || texto.trim().length < 5) {
      return {
        rawText: texto || '',
        erro: 'Não foi possível extrair texto suficiente da imagem. A imagem pode estar muito borrada ou ilegível.',
        aviso: 'Dica: Use imagens nítidas e com bom contraste.'
      };
    }

    return parsearTextoRegistro(texto);
    
  } catch (error: unknown) {
    console.error('❌ Erro no OCR:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Mensagens amigáveis para erros conhecidos
    if (errorMessage.includes('worker') || errorMessage.includes('importScripts') || errorMessage.includes('Failed to execute')) {
      return {
        rawText: '',
        erro: 'Erro ao carregar o motor de reconhecimento de texto (OCR).',
        aviso: 'Isso geralmente acontece quando há restrições de rede. Você pode preencher os campos manualmente - o sistema vai lembrar seus dados.'
      };
    }
    
    if (errorMessage.includes('Timeout')) {
      return {
        rawText: '',
        erro: 'O processamento demorou muito tempo.',
        aviso: 'Tente usar uma imagem menor ou mais simples.'
      };
    }
    
    if (errorMessage.includes('não disponível')) {
      return {
        rawText: '',
        erro: 'OCR não está funcionando nesta sessão.',
        aviso: 'Recarregue a página (F5) e tente novamente, ou preencha manualmente.'
      };
    }
    
    // Retornar erro genérico sem lançar exceção
    return {
      rawText: '',
      erro: `Falha ao processar imagem: ${errorMessage.substring(0, 100)}`,
      aviso: 'Você pode preencher os campos manualmente.'
    };
  }
}

/**
 * Parseia o texto extraído pelo OCR para encontrar os dados do registro
 */
function parsearTextoRegistro(texto: string): DadosExtraidosOCR {
  const dados: DadosExtraidosOCR = {
    rawText: texto,
  };

  // Normalizar texto
  const textoNormalizado = texto.replace(/\s+/g, ' ').toUpperCase();

  // 1. Identificar tipo de registro
  if (/NASCIMENTO|NASC/.test(textoNormalizado)) {
    dados.tipoRegistro = 'nascimento';
  } else if (/CASAMENTO|CASAM/.test(textoNormalizado)) {
    dados.tipoRegistro = 'casamento';
  } else if (/ÓBITO|OBITO|FALECIMENTO/.test(textoNormalizado)) {
    dados.tipoRegistro = 'obito';
  }

  // 2. Extrair Cartório de Registro
  const matchCartorio = texto.match(/(?:CARTÓRIO\s*(?:DE\s*REGISTRO)?)[\s:\-]*(?:CIVIL)?[\s:\-]*([A-ZÀ-Ú\s]+?)(?:\n|$|NÚMERO|NUMERO)/i);
  if (matchCartorio) {
    dados.cartorio = matchCartorio[1].trim();
  }

  // 3. Extrair Município e UF
  const matchMunicipio = texto.match(/(?:MUNICÍPIO|MUNICIPIO|MUNICÍPIO\s*NASCIMENTO)[\s:\-]*([A-ZÀ-Ú]+)/i);
  if (matchMunicipio) {
    dados.municipio = matchMunicipio[1].trim();
  }

  const matchUF = texto.match(/(?:UF|ORIGEM|ESTADO)[\s:\-]*(?:DO\s*CADASTRO)?[\s:\-]*([A-Z]{2})/i);
  if (matchUF) {
    dados.uf = matchUF[1];
  }

  // Combinar cartório + município se disponível
  if (!dados.cartorio && dados.municipio) {
    dados.cartorio = `${dados.municipio}${dados.uf ? '/' + dados.uf : ''}`;
  }

  // 4. Extrair MATRÍCULA - O mais importante!
  const padroesMatricula = [
    /MATRÍCULA[\s:\-]*([\d\s]{25,50})/i,
    /MATRICULA[\s:\-]*([\d\s]{25,50})/i,
    /MATR\.?\s*[\s:\-]*([\d\s]{25,50})/i,
    /(\d{5,6}\s+\d{2}\s+\d{2}\s+\d{4}\s+\d\s+\d{4,6}\s+\d{2,4}\s+\d{6,8}\s*\d{0,2})/,
  ];

  for (const padrao of padroesMatricula) {
    const match = texto.match(padrao);
    if (match) {
      const matriculaStr = match[1].trim();
      dados.matriculaCompleta = matriculaStr;
      
      const partes = matriculaStr.split(/\s+/).filter(p => p.length > 0);
      
      if (partes.length >= 3) {
        if (partes.length >= 8) {
          dados.livro = removerZerosEsquerda(partes[5]);
          dados.folha = removerZerosEsquerda(partes[6]);
          dados.termo = removerZerosEsquerda(partes[7]);
        } else if (partes.length >= 3) {
          const ultimosNumeros = partes.filter(p => /^\d+$/.test(p));
          if (ultimosNumeros.length >= 3) {
            dados.livro = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 3]);
            dados.folha = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 2]);
            dados.termo = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 1]);
          }
        }
      }
      
      break;
    }
  }

  // 5. Buscar campos individualmente se não encontrou na matrícula
  if (!dados.livro || !dados.folha || !dados.termo) {
    const matchLivro = texto.match(/LIVRO[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchLivro && !dados.livro) {
      dados.livro = removerZerosEsquerda(matchLivro[1]);
    }

    const matchFolha = texto.match(/FOLHA[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchFolha && !dados.folha) {
      dados.folha = removerZerosEsquerda(matchFolha[1]);
    }

    const matchTermo = texto.match(/TERMO[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchTermo && !dados.termo) {
      dados.termo = removerZerosEsquerda(matchTermo[1]);
    }
  }

  // 6. Extrair data de registro
  const matchData = texto.match(/DATA\s*(?:DO\s*REGISTRO)?[\s:\-]*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i);
  if (matchData) {
    dados.dataRegistro = matchData[1];
  }

  // 7. Extrair nome do registrado
  const matchNome = texto.match(/(?:NOME\s*(?:DO\s*)?REGISTRADO|REGISTRADO[\s:\(]*)([^(\n]+)/i);
  if (matchNome) {
    dados.nomeRegistrado = matchNome[1].trim();
  }

  return dados;
}

/**
 * Remove zeros à esquerda de um número (ex: 00036 → 36)
 */
function removerZerosEsquerda(valor: string): string {
  return valor.replace(/^0+/, '') || '0';
}

/**
 * Verifica se um item colado é uma imagem
 */
export function isImageFromClipboard(item: DataTransferItem): boolean {
  return item.type.indexOf('image') !== -1;
}

/**
 * Extrai arquivo de imagem da área de transferência
 */
export async function getImageFromClipboard(): Promise<File | null> {
  try {
    const clipboardItems = await navigator.clipboard.read();
    
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type as 'image/*');
          return new File([blob], 'imagem-registro.png', { type: blob.type });
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao acessar área de transferência:', error);
    return null;
  }
}
