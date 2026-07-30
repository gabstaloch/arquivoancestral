// OCR Utilities for Brazilian Civil Registry Documents
// Extracts: Cartório, Livro, Folha, Termo from pasted images

import Tesseract from 'tesseract.js';

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
}

/**
 * Processa uma imagem (File ou Blob) usando OCR para extrair dados do registro civil
 */
export async function processarImagemRegistro(file: File | Blob): Promise<DadosExtraidosOCR> {
  try {
    const result = await Tesseract.recognize(file, 'por', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const texto = result.data.text;
    console.log('Texto extraído pelo OCR:', texto);

    return parsearTextoRegistro(texto);
  } catch (error) {
    console.error('Erro no OCR:', error);
    throw new Error('Falha ao processar imagem. Tente novamente.');
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
  // Padrões: "Cartório de Registro:", "Cartório:", "CARTÓRIO"
  const matchCartorio = texto.match(/(?:CARTÓRIO\s*(?:DE\s*REGISTRO)?)[\s:\-]*(?:CIVIL)?[\s:\-]*([A-ZÀ-Ú\s]+?)(?:\n|$|NÚMERO|NUMERO)/i);
  if (matchCartorio) {
    dados.cartorio = matchCartorio[1].trim();
  }

  // 3. Extrair Município e UF
  // Padrão: "Indaial", "SC", "Indaial/SC"
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
  // Formato: "Matrícula: XXXXX XX XX XXXX X XXXXXX XXX XXXXXXX XX"
  // Exemplo: "107300 01 55 2005 1 00036 020 0018665 19"
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
      
      // Parsear a matrícula para extrair livro, folha, termo
      const partes = matriculaStr.split(/\s+/).filter(p => p.length > 0);
      
      // A matrícula geralmente tem o formato:
      // [código] [ano] [tipo] [outros] LIVRO FOLHA TERMO [digito]
      // Ou simplesmente os últimos 3 grupos numéricos
      
      if (partes.length >= 3) {
        // Tentar encontrar livro, folha, termo nos últimos grupos
        // Geralmente são os 3 últimos números significativos antes do dígito verificador
        
        // Procurar padrão específico: X grupos onde o 6º é livro, 7º é folha, 8º é termo
        if (partes.length >= 8) {
          // Formato completo
          dados.livro = removerZerosEsquerda(partes[5]); // 6º grupo (index 5)
          dados.folha = removerZerosEsquerda(partes[6]); // 7º grupo (index 6)
          dados.termo = removerZerosEsquerda(partes[7]); // 8º grupo (index 7)
        } else if (partes.length >= 3) {
          // Formato simplificado - pegar os 3 últimos números
          const ultimosNumeros = partes.filter(p => /^\d+$/.test(p));
          if (ultimosNumeros.length >= 3) {
            dados.livro = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 3]);
            dados.folha = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 2]);
            dados.termo = removerZerosEsquerda(ultimosNumeros[ultimosNumeros.length - 1]);
          }
        }
      }
      
      break; // Usar primeiro match encontrado
    }
  }

  // 5. Se não encontrou pela matrícula, tentar encontrar individualmente
  if (!dados.livro || !dados.folha || !dados.termo) {
    // Buscar "Livro" explicitamente
    const matchLivro = texto.match(/LIVRO[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchLivro && !dados.livro) {
      dados.livro = removerZerosEsquerda(matchLivro[1]);
    }

    // Buscar "Folha" explicitamente
    const matchFolha = texto.match(/FOLHA[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchFolha && !dados.folha) {
      dados.folha = removerZerosEsquerda(matchFolha[1]);
    }

    // Buscar "Termo" explicitamente
    const matchTermo = texto.match(/TERMO[\s:\-]*(?:N[°O]?|\s)*[\s:]*(\d+)/i);
    if (matchTermo && !dados.termo) {
      dados.termo = removerZerosEsquerda(matchTermo[1]);
    }
  }

  // 6. Extrair data de registro (se disponível)
  const matchData = texto.match(/DATA\s*(?:DO\s*REGISTRO)?[\s:\-]*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})/i);
  if (matchData) {
    dados.dataRegistro = matchData[1];
  }

  // 7. Extrair nome do registrado (se disponível)
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
