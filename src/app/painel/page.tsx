"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Users,
  Eye,
  Trash2,
  Filter,
  DollarSign,
  CalendarDays,
  Phone,
  Mail,
} from "lucide-react";
import { 
  Cliente, 
  getClientes, 
  addCliente, 
  deleteCliente,
  getStatusLabel, 
  getStatusColor,
  calcularLucroLiquido
} from "@/lib/crm-store";
import FichaCliente from "@/components/crm/ficha-cliente";

export default function PainelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoWhatsapp, setNovoWhatsapp] = useState("");

  function carregarClientes() {
    let lista = getClientes();
    
    // Apply search filter
    if (busca) {
      lista = lista.filter(c => 
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.email.toLowerCase().includes(busca.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filtroStatus !== "todos") {
      lista = lista.filter(c => c.status === filtroStatus);
    }
    
    setClientes(lista);
  }

  // Always call hooks - no conditional returns before hooks
  useEffect(() => {
    carregarClientes();
  }, [busca, filtroStatus]);

  // Show FichaCliente if client is selected (after all hooks)
  if (clienteId) {
    return <FichaCliente />;
  }

  async function handleAddCliente() {
    if (!novoNome.trim()) return;
    
    const cliente = addCliente(novoNome.trim(), novoEmail.trim(), novoWhatsapp.trim());
    
    setDialogAberto(false);
    setNovoNome("");
    setNovoEmail("");
    setNovoWhatsapp("");
    
    // Navigate to the new client's detail page
    router.push(`/painel?cliente=${cliente.id}`);
  }

  async function handleDeleteCliente(id: string, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      deleteCliente(id);
      carregarClientes();
    }
  }

  function calcularTotalRecebido(cliente: Cliente): number {
    let total = 0;
    if (cliente.financeiro.taxaAnalise.status === "pago") total += cliente.financeiro.taxaAnalise.valor;
    if (cliente.financeiro.taxaSucesso.status === "pago") total += cliente.financeiro.taxaSucesso.valor;
    return total;
  }

  function calcularTotalPendente(cliente: Cliente): number {
    let total = 0;
    if (cliente.financeiro.taxaAnalise.status !== "pago") total += cliente.financeiro.taxaAnalise.valor;
    if (cliente.financeiro.taxaSucesso.status !== "pago" && cliente.financeiro.taxaSucesso.status !== "aguardando") {
      total += cliente.financeiro.taxaSucesso.valor;
    }
    return total;
  }

  // Stats
  const totalClientes = getClientes().length;
  const emAnalise = getClientes().filter(c => c.status === "em_analise").length;
  const concluidos = getClientes().filter(c => c.status === "concluido").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-700 text-navy sm:text-3xl">
            Gestão de Pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe e gerencie todos os casos de pesquisa genealógica
          </p>
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-navy-light text-white">
              <Plus className="size-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-navy">Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados básicos para criar uma nova ficha de pesquisa.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">Nome Completo *</label>
                <Input
                  placeholder="Ex: João Silva Müller"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">E-mail</label>
                <Input
                  type="email"
                  placeholder="cliente@email.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy">WhatsApp</label>
                <Input
                  placeholder="(47) 99999-9999"
                  value={novoWhatsapp}
                  onChange={(e) => setNovoWhatsapp(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddCliente}
                  disabled={!novoNome.trim()}
                  className="bg-navy hover:bg-navy-light"
                >
                  Criar Ficha
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-navy/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-navy/10 flex items-center justify-center">
              <Users className="size-5 text-navy" />
            </div>
            <div>
              <p className="text-2xl font-700 text-navy">{totalClientes}</p>
              <p className="text-xs text-muted-foreground">Total de Clientes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Search className="size-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-700 text-yellow-800">{emAnalise}</p>
              <p className="text-xs text-muted-foreground">Em Análise</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="size-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-700 text-green-800">{concluidos}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 border-navy/20"
          />
        </div>
        
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-48 border-navy/20">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="pesquisa_europa">Pesquisa na Europa</SelectItem>
            <SelectItem value="aguardando_emissao">Aguardando Emissão</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client list */}
      {clientes.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-serif text-lg font-600 text-navy mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {busca || filtroStatus !== "todos" 
                ? "Tente ajustar os filtros de busca."
                : "Comece adicionando seu primeiro cliente ao sistema."
              }
            </p>
            {!busca && filtroStatus === "todos" && (
              <Button onClick={() => setDialogAberto(true)} className="bg-navy hover:bg-navy-light">
                <Plus className="size-4 mr-2" />
                Adicionar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow border-navy/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="font-600 text-navy text-sm">
                          {cliente.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-lg font-600 text-navy truncate">
                          {cliente.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {cliente.dataEntrada}
                          </span>
                          {cliente.email && (
                            <span className="flex items-center gap-1 truncate max-w-[180px]">
                              <Mail className="size-3" />
                              {cliente.email}
                            </span>
                          )}
                          {cliente.whatsapp && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {cliente.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge className={`${getStatusColor(cliente.status)} shrink-0`}>
                    {getStatusLabel(cliente.status)}
                  </Badge>

                  {/* Financial summary */}
                  <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Recebido</p>
                      <p className="font-600 text-green-700">
                        R$ {calcularTotalRecebido(cliente).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pendente</p>
                      <p className="font-600 text-orange-600">
                        R$ {calcularTotalPendente(cliente).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Lucro</p>
                      <p className={`font-700 ${calcularLucroLiquido(cliente) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        R$ {calcularLucroLiquido(cliente).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-navy/30 text-navy hover:bg-navy hover:text-white"
                      onClick={() => router.push(`/painel?cliente=${cliente.id}`)}
                    >
                      <Eye className="size-4 mr-1" />
                      Abrir Ficha
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteCliente(cliente.id, cliente.nome)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
