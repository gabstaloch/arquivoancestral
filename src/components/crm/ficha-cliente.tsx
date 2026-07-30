"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TreePine,
  User,
  Users,
  DollarSign,
  Clock,
  FileText,
  CalendarDays,
  MapPin,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import {
  Cliente,
  NoArvore,
  Despesa,
  EntradaTimeline,
  StatusCliente,
  getClienteById,
  updateCliente,
  addNoArvore,
  updateNoArvore,
  deleteNoArvore,
  addDespesa,
  updateStatusPagamento,
  deleteDespesa,
  addEntradaTimeline,
  deleteEntradaTimeline,
  calcularLucroLiquido,
  getStatusLabel,
  getStatusColor,
  getStatusRegistroLabel,
  getStatusRegistroColor,
  generateId,
} from "@/lib/crm-store";

// Tree node component for visualization
function TreeNode({ 
  no, 
  onEdit, 
  depth = 0 
}: { 
  no: NoArvore; 
  onEdit: (no: NoArvore) => void;
  depth?: number;
}) {
  const relacaoLabels: Record<string, string> = {
    requerente: "Requerente",
    pai: "Pai",
    mae: "Mãe",
    avo_paterno: "Avô Paterno",
    avo_paterna: "Avó Paterna",
    avo_materno: "Avô Materno",
    avo_materna: "Avó Materna",
    ancestral: "Ancestral Europeu",
  };

  return (
    <div 
      className="group relative"
      style={{ marginLeft: depth > 0 ? `${depth * 24}px` : 0 }}
    >
      <Card className={`transition-all hover:shadow-md cursor-pointer ${
        no.relacao === 'ancestral' ? 'border-gold/40 bg-gold/5' : 'border-navy/10'
      }`}>
        <CardContent className="p-3 sm:p-4" onClick={() => onEdit(no)}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
              no.relacao === 'ancestral' ? 'bg-gold/20' : 'bg-navy/10'
            }`}>
              {no.relacao === 'requerente' || no.relacao === 'ancestral' ? (
                <User className={`size-5 ${no.relacao === 'ancestral' ? 'text-gold-dark' : 'text-navy'}`} />
              ) : (
                <Users className="size-5 text-navy/70" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-navy truncate">{no.nomeCompleto}</h4>
                <Badge variant="outline" className="text-[10px]">
                  {relacaoLabels[no.relacao] || no.relacao}
                </Badge>
                <Badge className={`${getStatusRegistroColor(no.statusRegistro)} text-[10px]`}>
                  {getStatusRegistroLabel(no.statusRegistro)}
                </Badge>
              </div>
              
              {(no.nascimento || no.casamento || no.obito) && (
                <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-muted-foreground">
                  {no.nascimento && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      Nasc: {no.nascimento.data}{no.nascimento.local ? ` - ${no.nascimento.local}` : ''}
                    </span>
                  )}
                  {no.casamento && (
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      Casam: {no.casamento.data}
                    </span>
                  )}
                  {no.obito && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      Óbito: {no.obito.data}
                    </span>
                  )}
                </div>
              )}
              
              {no.variacoesGrafia && (
                <p className="mt-1 text-[11px] text-muted-foreground italic">
                  Var.: {no.variacoesGrafia}
                </p>
              )}
            </div>

            {/* Edit indicator */}
            <Edit2 className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Connector line */}
      {depth < 3 && (
        <div className="w-px h-4 bg-navy/20 ml-5" />
      )}
    </div>
  );
}

export default function FichaCliente() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");
  
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("arvore");
  const [salvando, setSalvando] = useState(false);
  
  // Modal states
  const [noSelecionado, setNoSelecionado] = useState<NoArvore | null>(null);
  const [dialogNoAberto, setDialogNoAberto] = useState(false);
  const [dialogNovoNoAberto, setDialogNovoNoAberto] = useState(false);
  const [dialogDespesaAberto, setDialogDespesaAberto] = useState(false);
  
  // Form states
  const [novoNoRelacao, setNovoNoRelacao] = useState("pai");
  const [formNo, setFormNo] = useState<Partial<NoArvore>>({});
  const [formDespesa, setFormDespesa] = useState({
    descricao: "",
    valor: "",
    moeda: "BRL" as "BRL" | "EUR" | "USD",
    categoria: "outro" as Despesa["categoria"],
  });
  const [novaEntradaTitulo, setNovaEntradaTitulo] = useState("");
  const [novaEntradaDescricao, setNovaEntradaDescricao] = useState("");
  const [novoLink, setNovoLink] = useState("");

  // Load client data
  function carregarCliente() {
    if (clienteId) {
      const c = getClienteById(clienteId);
      if (c) {
        setCliente(c);
      } else {
        router.push("/painel");
      }
    }
  }

  useEffect(() => {
    carregarCliente();
  }, [clienteId]);

  async function handleSalvar() {
    if (!cliente) return;
    
    setSalvando(true);
    await new Promise(r => setTimeout(r, 500));
    
    updateCliente(cliente.id, cliente);
    setSalvando(false);
    
    // Show success feedback
    alert("Ficha salva com sucesso!");
  }

  function handleStatusChange(novoStatus: StatusCliente) {
    if (!cliente) return;
    setCliente({ ...cliente, status: novoStatus });
  }

  // Tree operations
  function abrirEditarNo(no: NoArvore) {
    setFormNo({ ...no });
    setNoSelecionado(no);
    setDialogNoAberto(true);
  }

  function salvarNo() {
    if (!cliente || !noSelecionado) return;
    
    const atualizado = updateNoArvore(cliente.id, noSelecionado.id, formNo);
    if (atualizado) {
      setCliente({
        ...cliente,
        arvore: cliente.arvore.map(n => n.id === noSelecionado.id ? atualizado! : n)
      });
    }
    
    setDialogNoAberto(false);
    setNoSelecionado(null);
    setFormNo({});
  }

  function adicionarNovoNo() {
    if (!cliente) return;
    
    const novoNo = addNoArvore(cliente.id, {
      nomeCompleto: "",
      relacao: novoNoRelacao as NoArvore["relacao"],
      statusRegistro: "pendente",
      variacoesGrafia: "",
      anotacoesCartorio: "",
    });
    
    if (novoNo) {
      setCliente({
        ...cliente,
        arvore: [...cliente.arvore, novoNo]
      });
      
      // Open edit dialog for the new node
      setFormNo({ ...novoNo });
      setNoSelecionado(novoNo);
      setDialogNoAberto(true);
    }
    
    setDialogNovoNoAberto(false);
  }

  function excluirNo(noId: string) {
    if (!cliente) return;
    
    deleteNoArvore(cliente.id, noId);
    setCliente({
      ...cliente,
      arvore: cliente.arvore.filter(n => n.id !== noId)
    });
  }

  // Financial operations
  function adicionarDespesa() {
    if (!cliente) return;
    
    const valorNumerico = parseFloat(formDespesa.valor.replace(",", "."));
    if (isNaN(valorNumerico)) {
      alert("Valor inválido");
      return;
    }
    
    const novaDespesa = addDespesa(cliente.id, {
      descricao: formDespesa.descricao,
      valor: valorNumerico,
      moeda: formDespesa.moeda,
      data: new Date().toLocaleDateString("pt-BR"),
      categoria: formDespesa.categoria,
    });
    
    if (novaDespesa) {
      setCliente({
        ...cliente,
        financeiro: {
          ...cliente.financeiro,
          despesas: [...cliente.financeiro.despesas, novaDespesa]
        }
      });
    }
    
    setDialogDespesaAberto(false);
    setFormDespesa({ descricao: "", valor: "", moeda: "BRL", categoria: "outro" });
  }

  function excluirDespesa(despesaId: string) {
    if (!cliente) return;
    
    deleteDespesa(cliente.id, despesaId);
    setCliente({
      ...cliente,
      financeiro: {
        ...cliente.financeiro,
        despesas: cliente.financeiro.despesas.filter(d => d.id !== despesaId)
      }
    });
  }

  function alterarStatusPagamento(tipo: "taxaAnalise" | "taxaSucesso", status: "pago" | "pendente" | "aguardando") {
    if (!cliente) return;
    
    updateStatusPagamento(cliente.id, tipo, status);
    
    setCliente({
      ...cliente,
      financeiro: {
        ...cliente.financeiro,
        [tipo]: {
          ...cliente.financeiro[tipo],
          status
        }
      }
    });
  }

  // Timeline operations
  function adicionarEntradaTimeline() {
    if (!cliente || !novaEntradaTitulo.trim()) return;
    
    const links = novoLink.trim() ? [novoLink.trim()] : undefined;
    
    const novaEntrada = addEntradaTimeline(cliente.id, {
      data: new Date().toLocaleDateString("pt-BR"),
      titulo: novaEntradaTitulo.trim(),
      descricao: novaEntradaDescricao.trim(),
      links,
    });
    
    if (novaEntrada) {
      setCliente({
        ...cliente,
        timeline: [novaEntrada, ...cliente.timeline]
      });
    }
    
    setNovaEntradaTitulo("");
    setNovaEntradaDescricao("");
    setNovoLink("");
  }

  function excluirEntrada(entradaId: string) {
    if (!cliente) return;
    
    deleteEntradaTimeline(cliente.id, entradaId);
    setCliente({
      ...cliente,
      timeline: cliente.timeline.filter(e => e.id !== entradaId)
    });
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 border-3 border-navy/20 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  const lucroLiquido = calcularLucroLiquido(cliente);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/painel")}
            className="text-navy"
          >
            <ArrowLeft className="size-5" />
          </Button>
          
          <div>
            <h1 className="font-serif text-xl font-700 text-navy sm:text-2xl">
              {cliente.nome}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cliente desde {cliente.dataEntrada} • ID: {cliente.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status selector */}
          <Select value={cliente.status} onValueChange={(v) => handleStatusChange(v as StatusCliente)}>
            <SelectTrigger className="w-44 border-navy/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="pesquisa_europa">Pesquisa na Europa</SelectItem>
              <SelectItem value="aguardando_emissao">Aguardando Emissão</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-navy hover:bg-navy-light text-white"
          >
            {salvando ? (
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="bg-navy/5 border border-border w-full justify-start overflow-x-auto">
          <TabsTrigger value="arvore" className="data-[state=active]:bg-navy data-[state=active]:text-white">
            <TreePine className="size-4 mr-2" />
            Árvore Genealógica
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-navy data-[state=active]:text-white">
            <DollarSign className="size-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-navy data-[state=active]:text-white">
            <Clock className="size-4 mr-2" />
            Diário de Pesquisa
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Árvore Genealógica */}
        <TabsContent value="arvore" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-600 text-navy">
                Linhagem Familiar & Documentos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em qualquer nó da árvore para editar os dados. Adicione membros da família para mapear a linhagem completa.
              </p>
            </div>
            
            <Dialog open={dialogNovoNoAberto} onOpenChange={setDialogNovoNoAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-navy/30 text-navy hover:bg-navy hover:text-white">
                  <Plus className="size-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-navy">Adicionar Membro da Família</DialogTitle>
                  <DialogDescription>
                    Selecione o grau de parentesco do novo membro.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy">Grau de Parentesco *</label>
                    <Select value={novoNoRelacao} onValueChange={setNovoNoRelacao}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pai">Pai</SelectItem>
                        <SelectItem value="mae">Mãe</SelectItem>
                        <SelectItem value="avo_paterno">Avô Paterno</SelectItem>
                        <SelectItem value="avo_paterna">Avó Paterna</SelectItem>
                        <SelectItem value="avo_materno">Avô Materno</SelectItem>
                        <SelectItem value="avo_materna">Avó Materna</SelectItem>
                        <SelectItem value="ancestral">Ancestral Europeu / Emigrante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setDialogNovoNoAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={adicionarNovoNo} className="bg-navy hover:bg-navy-light text-white">
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tree visualization */}
          <div className="space-y-3">
            {cliente.arvore.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <TreePine className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-serif text-lg font-600 text-navy mb-2">
                    Árvore Vazia
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione membros da família para começar a montar a árvore genealógica.
                  </p>
                </CardContent>
              </Card>
            ) : (
              cliente.arvore.map((no) => (
                <div key={no.id} className="relative group/item">
                  <TreeNode 
                    no={no} 
                    onEdit={abrirEditarNo}
                    depth={no.relacao === 'requerente' ? 0 : 
                          ['pai', 'mae'].includes(no.relacao) ? 1 :
                          no.relacao.includes('avo') ? 2 : 3}
                  />
                  
                  {/* Delete button */}
                  {no.relacao !== 'requerente' && (
                    <button
                      onClick={() => excluirNo(no.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Financeiro */}
        <TabsContent value="financeiro" className="mt-6 space-y-6">
          <div>
            <h2 className="font-serif text-lg font-600 text-navy">
              Financeiro & Emolumentos Operacionais
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Controle recebimentos, gastos operacionais e calcule o lucro líquido do caso.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recebimentos */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-600 text-green-800 flex items-center gap-2">
                  <DollarSign className="size-5" />
                  Resumo de Recebimentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Taxa de Análise */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium text-green-900">Taxa de Análise Inicial</p>
                    <p className="text-sm text-green-700">R$ {cliente.financeiro.taxaAnalise.valor.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <Select 
                    value={cliente.financeiro.taxaAnalise.status} 
                    onValueChange={(v) => alterarStatusPagamento("taxaAnalise", v as "pago" | "pendente")}
                  >
                    <SelectTrigger className="w-28 border-green-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago ✓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Taxa de Sucesso */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div>
                    <p className="font-medium text-blue-900">Taxa de Sucesso</p>
                    <p className="text-sm text-blue-700">R$ {cliente.financeiro.taxaSucesso.valor.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <Select 
                    value={cliente.financeiro.taxaSucesso.status} 
                    onValueChange={(v) => alterarStatusPagamento("taxaSucesso", v as "pago" | "pendente" | "aguardando")}
                  >
                    <SelectTrigger className="w-32 border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando">Aguardando</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago ✓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lucro Líquido */}
                <div className={`p-4 rounded-lg ${lucroLiquido >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-600 ${lucroLiquido >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      💰 Lucro Líquido
                    </span>
                    <span className={`text-xl font-700 ${lucroLiquido >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      R$ {lucroLiquido.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Despesas */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-600 text-orange-800 flex items-center gap-2">
                    <FileText className="size-5" />
                    Emolumentos & Custos
                  </CardTitle>
                  
                  <Dialog open={dialogDespesaAberto} onOpenChange={setDialogDespesaAberto}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                        <Plus className="size-4 mr-1" />
                        Nova Despesa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-serif text-navy">Adicionar Despesa</DialogTitle>
                        <DialogDescription>
                          Registre um gasto operacional do caso.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-navy">Descrição *</label>
                          <Input
                            placeholder="Ex: Taxa do Standesamt"
                            value={formDespesa.descricao}
                            onChange={(e) => setFormDespesa({...formDespesa, descricao: e.target.value})}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-navy">Valor *</label>
                            <Input
                              placeholder="0,00"
                              value={formDespesa.valor}
                              onChange={(e) => setFormDespesa({...formDespesa, valor: e.target.value})}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-navy">Moeda</label>
                            <Select value={formDespesa.moeda} onValueChange={(v) => setFormDespesa({...formDespesa, moeda: v as "BRL" | "EUR" | "USD"})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BRL">R$ BRL</SelectItem>
                                <SelectItem value="EUR">€ EUR</SelectItem>
                                <SelectItem value="USD">$ USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-navy">Categoria</label>
                          <Select value={formDespesa.categoria} onValueChange={(v) => setFormDespesa({...formDespesa, categoria: v as Despesa["categoria"]})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="taxa_arquivo">Taxa de Arquivo</SelectItem>
                              <SelectItem value="frete">Frete/Correio</SelectItem>
                              <SelectItem value="cartorio_br">Cartório BR</SelectItem>
                              <SelectItem value="traducao">Tradução</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" onClick={() => setDialogDespesaAberto(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={adicionarDespesa} className="bg-navy hover:bg-navy-light text-white">
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {cliente.financeiro.despesas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma despesa registrada.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto elegant-scroll">
                    {cliente.financeiro.despesas.map((desp) => (
                      <div key={desp.id} className="flex items-center justify-between p-2 rounded bg-orange-50/50 group">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-orange-900 truncate">{desp.descricao}</p>
                          <p className="text-xs text-orange-700">{desp.data} • {desp.categoria.replace("_", " ")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-600 text-orange-800 whitespace-nowrap">
                            {desp.moeda === "BRL" ? "R$" : desp.moeda === "EUR" ? "€" : "$"} {desp.valor.toFixed(2).replace(".", ",")}
                          </span>
                          <button
                            onClick={() => excluirDespesa(desp.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total despesas */}
                    <div className="pt-2 mt-2 border-t border-orange-200 flex justify-between text-sm font-600 text-orange-900">
                      <span>Total de Despesas:</span>
                      <span>R$ {cliente.financeiro.despesas.reduce((s, d) => s + d.valor, 0).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Timeline */}
        <TabsContent value="timeline" className="mt-6 space-y-6">
          <div>
            <h2 className="font-serif text-lg font-600 text-navy">
              Diário de Pesquisa
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Registre o progresso da investigação, comunicações com arquivos europeus e marcos importantes.
            </p>
          </div>

          {/* Quick add entry */}
          <Card className="border-navy/10">
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Título do evento (ex: E-mail enviado ao arquivo)"
                  value={novaEntradaTitulo}
                  onChange={(e) => setNovaEntradaTitulo(e.target.value)}
                />
                <Input
                  placeholder="Link opcional (ex: Google Drive)"
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Descrição detalhada do progresso..."
                value={novaEntradaDescricao}
                onChange={(e) => setNovaEntradaDescricao(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end">
                <Button
                  onClick={adicionarEntradaTimeline}
                  disabled={!novaEntradaTitulo.trim()}
                  className="bg-navy hover:bg-navy-light text-white"
                >
                  <Plus className="size-4 mr-2" />
                  Registrar Entrada
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline list */}
          {cliente.timeline.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <Clock className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-serif text-lg font-600 text-navy mb-2">
                  Nenhum Registro Ainda
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comece a documentar o progresso da pesquisa adicionando entradas acima.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {cliente.timeline.map((entrada) => (
                <Card key={entrada.id} className="border-navy/10 group relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Timeline dot */}
                      <div className="mt-1 size-3 rounded-full bg-navy shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-500 text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                                {entrada.data}
                              </span>
                              <h4 className="font-medium text-navy">{entrada.titulo}</h4>
                            </div>
                            
                            {entrada.descricao && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {entrada.descricao}
                              </p>
                            )}
                            
                            {entrada.links && entrada.links.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {entrada.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    <ExternalLink className="size-3" />
                                    Abrir Link
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => excluirEntrada(entrada.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Node Modal */}
      <Dialog open={dialogNoAberto} onOpenChange={setDialogNoAberto}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-navy flex items-center gap-2">
              <User className="size-5" />
              Editar Membro da Família
            </DialogTitle>
            <DialogDescription>
              Atualize os dados pessoais e registros deste membro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Nome Completo *</label>
              <Input
                value={formNo.nomeCompleto || ""}
                onChange={(e) => setFormNo({...formNo, nomeCompleto: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Data Nascimento</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={formNo.nascimento?.data || ""}
                  onChange={(e) => setFormNo({
                    ...formNo, 
                    nascimento: {...(formNo.nascimento || {}), data: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Local Nasc.</label>
                <Input
                  placeholder="Cidade, País"
                  value={formNo.nascimento?.local || ""}
                  onChange={(e) => setFormNo({
                    ...formNo, 
                    nascimento: {...(formNo.nascimento || {}), local: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Data Casamento</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={formNo.casamento?.data || ""}
                  onChange={(e) => setFormNo({
                    ...formNo, 
                    casamento: {...(formNo.casamento || {}), data: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Data Óbito</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={formNo.obito?.data || ""}
                  onChange={(e) => setFormNo({
                    ...formNo, 
                    obito: {...(formNo.obito || {}), data: e.target.value}
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Status do Registro</label>
              <Select 
                value={formNo.statusRegistro || "pendente"} 
                onValueChange={(v) => setFormNo({...formNo, statusRegistro: v as NoArvore["statusRegistro"]})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="localizado">✓ Localizado</SelectItem>
                  <SelectItem value="pendente">⏳ Pendente</SelectItem>
                  <SelectItem value="em_busca">🔍 Em Busca na Europa</SelectItem>
                  <SelectItem value="nao_existe">✗ Não Existe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Variações de Grafia do Nome</label>
              <Input
                placeholder="Ex: Müller, Mueller, Muller"
                value={formNo.variacoesGrafia || ""}
                onChange={(e) => setFormNo({...formNo, variacoesGrafia: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Anotações de Cartório</label>
              <textarea
                placeholder="Observações sobre registros, livros, paróquias..."
                value={formNo.anotacoesCartorio || ""}
                onChange={(e) => setFormNo({...formNo, anotacoesCartorio: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogNoAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarNo} className="bg-navy hover:bg-navy-light text-white">
                <Check className="size-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
