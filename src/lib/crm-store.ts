// CRM Store with localStorage persistence
import { Cliente, StatusCliente, NoArvore, Despesa, EntradaTimeline, Financeiro, CrmState } from "./crm-types";

const STORAGE_KEY = "arquivo-ancestral-crm";
const AUTH_KEY = "arquivo-ancestral-auth";

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Default client template
function createNewCliente(nome: string, email: string, whatsapp: string): Cliente {
  const agora = new Date().toISOString();
  return {
    id: generateId(),
    nome,
    email,
    whatsapp,
    dataEntrada: new Date().toLocaleDateString("pt-BR"),
    status: "em_analise" as StatusCliente,
    arvore: [
      {
        id: generateId(),
        nomeCompleto: nome,
        relacao: "requerente",
        statusRegistro: "pendente",
        variacoesGrafia: "",
        anotacoesCartorio: "",
      },
    ],
    financeiro: {
      taxaAnalise: { valor: 250, status: "pendente" },
      taxaSucesso: { valor: 1250, status: "aguardando" },
      despesas: [],
    },
    timeline: [],
    anotacoesGerais: "",
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

// Get state from localStorage
function getState(): CrmState {
  if (typeof window === "undefined") {
    return { autenticado: false, clientes: [], clienteSelecionado: null };
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading CRM state:", e);
  }
  
  return { autenticado: false, clientes: [], clienteSelecionado: null };
}

// Save state to localStorage
function saveState(state: CrmState): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving CRM state:", e);
  }
}

// Auth functions
export function login(senha: string): boolean {
  // Simple password check
  if (senha === "admin123") {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, "true");
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

// Client CRUD operations
export function getClientes(): Cliente[] {
  const state = getState();
  return state.clientes.sort((a, b) => 
    new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );
}

export function getClienteById(id: string): Cliente | undefined {
  const state = getState();
  return state.clientes.find(c => c.id === id);
}

export function addCliente(nome: string, email: string, whatsapp: string): Cliente {
  const state = getState();
  const novoCliente = createNewCliente(nome, email, whatsapp);
  state.clientes.push(novoCliente);
  saveState(state);
  return novoCliente;
}

export function updateCliente(id: string, updates: Partial<Cliente>): Cliente | null {
  const state = getState();
  const index = state.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  state.clientes[index] = {
    ...state.clientes[index],
    ...updates,
    atualizadoEm: new Date().toISOString(),
  };
  
  saveState(state);
  return state.clientes[index];
}

export function deleteCliente(id: string): boolean {
  const state = getState();
  const index = state.clientes.findIndex(c => c.id === id);
  
  if (index === -1) return false;
  
  state.clientes.splice(index, 1);
  saveState(state);
  return true;
}

// Tree operations
export function addNoArvore(clienteId: string, no: Omit<NoArvore, "id">): NoArvore | null {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return null;
  
  const novoNo: NoArvore = { ...no, id: generateId() };
  state.clientes[clienteIndex].arvore.push(novoNo);
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return novoNo;
}

export function updateNoArvore(clienteId: string, noId: string, updates: Partial<NoArvore>): NoArvore | null {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return null;
  
  const noIndex = state.clientes[clienteIndex].arvore.findIndex(n => n.id === noId);
  if (noIndex === -1) return null;
  
  state.clientes[clienteIndex].arvore[noIndex] = {
    ...state.clientes[clienteIndex].arvore[noIndex],
    ...updates,
  };
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return state.clientes[clienteIndex].arvore[noIndex];
}

export function deleteNoArvore(clienteId: string, noId: string): boolean {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return false;
  
  const noIndex = state.clientes[clienteIndex].arvore.findIndex(n => n.id === noId);
  if (noIndex === -1) return false;
  
  // Don't delete the requerente (first node)
  if (state.clientes[clienteIndex].arvore[noIndex].relacao === "requerente") {
    return false;
  }
  
  state.clientes[clienteIndex].arvore.splice(noIndex, 1);
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return true;
}

// Financial operations
export function addDespesa(clienteId: string, despesa: Omit<Despesa, "id">): Despesa | null {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return null;
  
  const novaDespesa: Despesa = { ...despesa, id: generateId() };
  state.clientes[clienteIndex].financeiro.despesas.push(novaDespesa);
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return novaDespesa;
}

export function updateStatusPagamento(
  clienteId: string, 
  tipo: "taxaAnalise" | "taxaSucesso", 
  status: "pago" | "pendente" | "aguardando"
): boolean {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return false;
  
  state.clientes[clienteIndex].financeiro[tipo].status = status;
  if (status === "pago") {
    state.clientes[clienteIndex].financeiro[tipo].dataPago = new Date().toISOString();
  }
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return true;
}

export function deleteDespesa(clienteId: string, despesaId: string): boolean {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return false;
  
  const despesaIndex = state.clientes[clienteIndex].financeiro.despesas.findIndex(d => d.id === despesaId);
  if (despesaIndex === -1) return false;
  
  state.clientes[clienteIndex].financeiro.despesas.splice(despesaIndex, 1);
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return true;
}

// Calculate profit
export function calcularLucroLiquido(cliente: Cliente): number {
  const totalRecebido = 
    (cliente.financeiro.taxaAnalise.status === "pago" ? cliente.financeiro.taxaAnalise.valor : 0) +
    (cliente.financeiro.taxaSucesso.status === "pago" ? cliente.financeiro.taxaSucesso.valor : 0);
  
  const totalDespesas = cliente.financeiro.despesas.reduce((sum, d) => sum + d.valor, 0);
  
  return totalRecebido - totalDespesas;
}

// Timeline operations
export function addEntradaTimeline(
  clienteId: string, 
  entrada: Omit<EntradaTimeline, "id">
): EntradaTimeline | null {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return null;
  
  const novaEntrada: EntradaTimeline = { ...entrada, id: generateId() };
  state.clientes[clienteIndex].timeline.unshift(novaEntrada); // Add to beginning
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return novaEntrada;
}

export function deleteEntradaTimeline(clienteId: string, entradaId: string): boolean {
  const state = getState();
  const clienteIndex = state.clientes.findIndex(c => c.id === clienteId);
  
  if (clienteIndex === -1) return false;
  
  const entradaIndex = state.clientes[clienteIndex].timeline.findIndex(e => e.id === entradaId);
  if (entradaIndex === -1) return false;
  
  state.clientes[clienteIndex].timeline.splice(entradaIndex, 1);
  state.clientes[clienteIndex].atualizadoEm = new Date().toISOString();
  saveState(state);
  
  return true;
}

// Status helpers
export function getStatusLabel(status: StatusCliente): string {
  const labels: Record<StatusCliente, string> = {
    em_analise: "Em Análise",
    pesquisa_europa: "Pesquisa na Europa",
    aguardando_emissao: "Aguardando Emissão",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return labels[status];
}

export function getStatusColor(status: StatusCliente): string {
  const colors: Record<StatusCliente, string> = {
    em_analise: "bg-blue-100 text-blue-800",
    pesquisa_europa: "bg-purple-100 text-purple-800",
    aguardando_emissao: "bg-yellow-100 text-yellow-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };
  return colors[status];
}

export function getStatusRegistroLabel(status: string): string {
  const labels: Record<string, string> = {
    localizado: "Localizado",
    pendente: "Pendente",
    em_busca: "Em Busca na Europa",
    nao_existe: "Não Existe",
  };
  return labels[status] || status;
}

export function getStatusRegistroColor(status: string): string {
  const colors: Record<string, string> = {
    localizado: "bg-green-100 text-green-800",
    pendente: "bg-gray-100 text-gray-800",
    em_busca: "bg-blue-100 text-blue-800",
    nao_existe: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
