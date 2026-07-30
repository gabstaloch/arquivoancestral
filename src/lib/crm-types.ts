// CRM Types for Arquivo Ancestral Painel de Gestão

export type StatusCliente = 
  | "em_analise"
  | "pesquisa_europa"
  | "aguardando_emissao"
  | "concluido"
  | "cancelado";

export type StatusRegistro = 
  | "localizado"
  | "pendente"
  | "em_busca"
  | "nao_existe";

export type StatusPagamento = "pago" | "pendente" | "aguardando";

export interface DadosRegistroCivil {
  cartorio: string;    // Cartório de Registro Civil
  livro: string;       // Livro
  folha: string;       // Folha  
  termo: string;       // Termo
}

export interface DataRegistro {
  data: string;
  local: string;
  tipo: "nascimento" | "casamento" | "obito";
  registroCivil?: DadosRegistroCivil;  // Dados do cartório (opcional)
  completo: boolean;  // Indica se está completamente preenchido
}

export interface NoArvore {
  id: string;
  nomeCompleto: string;
  relacao: "requerente" | "pai" | "mae" | "avo_paterno" | "avo_paterna" | "avo_materno" | "avo_materna" | "ancestral";
  nascimento?: DataRegistro;
  casamento?: DataRegistro;
  obito?: DataRegistro;
  statusRegistro: StatusRegistro;
  variacoesGrafia: string;
  anotacoesCartorio: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  moeda: "BRL" | "EUR" | "USD";
  data: string;
  categoria: "taxa_arquivo" | "frete" | "cartorio_br" | "traducao" | "outro";
}

export interface EntradaTimeline {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
  links?: string[];
}

export interface Financeiro {
  taxaAnalise: {
    valor: number;
    status: StatusPagamento;
    dataPago?: string;
  };
  taxaSucesso: {
    valor: number;
    status: StatusPagamento;
    dataPago?: string;
  };
  despesas: Despesa[];
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  dataEntrada: string;
  status: StatusCliente;
  arvore: NoArvore[];
  financeiro: Financeiro;
  timeline: EntradaTimeline[];
  anotacoesGerais: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CrmState {
  autenticado: boolean;
  clientes: Cliente[];
  clienteSelecionado: Cliente | null;
}
