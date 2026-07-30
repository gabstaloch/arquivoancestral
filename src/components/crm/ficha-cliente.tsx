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
  CheckCircle2,
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
import ImagePasteZone from "@/components/crm/image-paste-zone";
import { DadosExtraidosOCR } from "@/lib/ocr-utils";

// Formata data brasileira: 10042004 → 10/04/2004
function formatarData(valor: string): string {
  // Remove tudo que não é dígito
  const digitos = valor.replace(/\D/g, "");
  
  // Limita a 8 dígitos (DDMMYYYY)
  const limitados = digitos.slice(0, 8);
  
  // Aplica a máscara progressiva
  if (limitados.length === 0) return "";
  if (limitados.length <= 2) return limitados;
  if (limitados.length <= 4) return `${limitados.slice(0, 2)}/${limitados.slice(2)}`;
  return `${limitados.slice(0, 2)}/${limitados.slice(2, 4)}/${limitados.slice(4)}`;
}

// Person card for family tree - ALL SAME SIZE with Registry Indicators
function PersonCard({ 
  no, 
  onEdit,
  showTooltip = true
}: { 
  no: NoArvore; 
  onEdit: (no: NoArvore) => void;
  showTooltip?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  
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

  // Get years of life
  const anoNasc = no.nascimento?.data?.split('/')?.[2] || '';
  const anoObito = no.obito?.data?.split('/')?.[2] || '';
  const anosVida = anoNasc ? (anoObito ? `${anoNasc}-${anoObito}` : `${anoNasc}-`) : '';

  // Check if registry data is complete
  const hasNascimento = !!(no.nascimento?.data && no.nascimento.completo);
  const hasCasamento = !!(no.casamento?.data && no.casamento.completo);
  const hasObito = !!(no.obito?.data && no.obito.completo);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card 
        className={`
          cursor-pointer transition-all duration-200 
          hover:shadow-xl hover:border-navy/50 hover:-translate-y-1
          border border-navy/20 bg-white w-[155px]
        `}
        onClick={() => onEdit(no)}
      >
        <CardContent className="p-3 text-center">
          {/* Avatar placeholder - SAME SIZE FOR ALL */}
          <div className="mx-auto size-11 rounded-full bg-navy/5 flex items-center justify-center">
            <User className="size-5 text-navy/60" />
          </div>
          
          {/* Name */}
          <h4 className="font-medium text-navy mt-2 truncate text-sm">
            {no.nomeCompleto || 'Adicionar'}
          </h4>
          
          {/* Years */}
          {anosVida && (
            <p className="text-muted-foreground text-xs">
              {anosVida}
            </p>
          )}

          {/* Status badge */}
          <Badge 
            variant="outline" 
            className={`
              mt-1.5 text-[9px] border-current
              ${no.statusRegistro === 'localizado' ? 'text-green-700 border-green-300 bg-green-50' :
                no.statusRegistro === 'pendente' ? 'text-yellow-700 border-yellow-300 bg-yellow-50' :
                no.statusRegistro === 'em_busca' ? 'text-blue-700 border-blue-300 bg-blue-50' :
                'text-gray-500 border-gray-300 bg-gray-50'}
            `}
          >
            {getStatusRegistroLabel(no.statusRegistro)}
          </Badge>

          {/* Registry indicators - Show when data is complete */}
          {(hasNascimento || hasCasamento || hasObito) && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
              {hasNascimento && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="size-2.5" />
                  Nasc
                </span>
              )}
              {hasCasamento && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="size-2.5" />
                  Casam
                </span>
              )}
              {hasObito && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="size-2.5" />
                  Óbito
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tooltip on Hover with Civil Registry Data */}
      {showTooltip && hovered && (
        <div className="absolute z-50 left-full ml-3 top-0 w-[300px] shadow-2xl rounded-xl border border-navy/15 bg-white p-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-navy/10">
            <div className="size-12 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
              <User className="size-6 text-navy/70" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-navy">{no.nomeCompleto}</h4>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {relacaoLabels[no.relacao] || no.relacao}
              </Badge>
            </div>
          </div>

          {/* Civil Registry Details */}
          <div className="mt-3 space-y-3 text-sm max-h-[280px] overflow-y-auto elegant-scroll">
            
            {/* Nascimento Section */}
            {no.nascimento?.data && (
              <div className={`rounded-lg p-2.5 ${hasNascimento ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {hasNascimento ? (
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                  ) : (
                    <CalendarDays className="size-4 text-green-600 shrink-0" />
                  )}
                  <span className="font-semibold text-green-800 text-xs uppercase tracking-wide">Nascimento</span>
                </div>
                
                <div className="space-y-1 ml-6 text-xs">
                  <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">{no.nascimento.data}</span></p>
                  {no.nascimento.local && <p><span className="text-muted-foreground">Local:</span> <span className="font-medium">{no.nascimento.local}</span></p>}
                  
                  {/* Civil Registry Details */}
                  {no.nascimento.registroCivil && (
                    <div className="mt-2 pt-2 border-t border-green-200/50 space-y-1">
                      {no.nascimento.registroCivil.cartorio && (
                        <p><span className="text-muted-foreground">Cartório:</span> <span className="font-medium">{no.nascimento.registroCivil.cartorio}</span></p>
                      )}
                      {no.nascimento.registroCivil.livro && (
                        <p><span className="text-muted-foreground">Livro:</span> <span className="font-medium">{no.nascimento.registroCivil.livro}</span></p>
                      )}
                      {no.nascimento.registroCivil.folha && (
                        <p><span className="text-muted-foreground">Folha:</span> <span className="font-medium">{no.nascimento.registroCivil.folha}</span></p>
                      )}
                      {no.nascimento.registroCivil.termo && (
                        <p><span className="text-muted-foreground">Termo:</span> <span className="font-medium">{no.nascimento.registroCivil.termo}</span></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Casamento Section */}
            {no.casamento?.data && (
              <div className={`rounded-lg p-2.5 ${hasCasamento ? 'bg-pink-50 border border-pink-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {hasCasamento ? (
                    <CheckCircle2 className="size-4 text-pink-600 shrink-0" />
                  ) : (
                    <FileText className="size-4 text-pink-600 shrink-0" />
                  )}
                  <span className="font-semibold text-pink-800 text-xs uppercase tracking-wide">Casamento</span>
                </div>
                
                <div className="space-y-1 ml-6 text-xs">
                  <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">{no.casamento.data}</span></p>
                  
                  {/* Civil Registry Details */}
                  {no.casamento.registroCivil && (
                    <div className="mt-2 pt-2 border-t border-pink-200/50 space-y-1">
                      {no.casamento.registroCivil.cartorio && (
                        <p><span className="text-muted-foreground">Cartório:</span> <span className="font-medium">{no.casamento.registroCivil.cartorio}</span></p>
                      )}
                      {no.casamento.registroCivil.livro && (
                        <p><span className="text-muted-foreground">Livro:</span> <span className="font-medium">{no.casamento.registroCivil.livro}</span></p>
                      )}
                      {no.casamento.registroCivil.folha && (
                        <p><span className="text-muted-foreground">Folha:</span> <span className="font-medium">{no.casamento.registroCivil.folha}</span></p>
                      )}
                      {no.casamento.registroCivil.termo && (
                        <p><span className="text-muted-foreground">Termo:</span> <span className="font-medium">{no.casamento.registroCivil.termo}</span></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Óbito Section */}
            {no.obito?.data && (
              <div className={`rounded-lg p-2.5 ${hasObito ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {hasObito ? (
                    <CheckCircle2 className="size-4 text-gray-600 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 text-gray-500 shrink-0" />
                  )}
                  <span className="font-semibold text-gray-800 text-xs uppercase tracking-wide">Óbito</span>
                </div>
                
                <div className="space-y-1 ml-6 text-xs">
                  <p><span className="text-muted-foreground">Data:</span> <span className="font-medium">{no.obito.data}</span></p>
                  
                  {/* Civil Registry Details */}
                  {no.obito.registroCivil && (
                    <div className="mt-2 pt-2 border-t border-gray-300/50 space-y-1">
                      {no.obito.registroCivil.cartorio && (
                        <p><span className="text-muted-foreground">Cartório:</span> <span className="font-medium">{no.obito.registroCivil.cartorio}</span></p>
                      )}
                      {no.obito.registroCivil.livro && (
                        <p><span className="text-muted-foreground">Livro:</span> <span className="font-medium">{no.obito.registroCivil.livro}</span></p>
                      )}
                      {no.obito.registroCivil.folha && (
                        <p><span className="text-muted-foreground">Folha:</span> <span className="font-medium">{no.obito.registroCivil.folha}</span></p>
                      )}
                      {no.obito.registroCivil.termo && (
                        <p><span className="text-muted-foreground">Termo:</span> <span className="font-medium">{no.obito.registroCivil.termo}</span></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Name variations */}
            {no.variacoesGrafia && (
              <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                <MapPin className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800 text-xs">Variações de Grafia</p>
                  <p className="text-purple-700 italic text-xs">{no.variacoesGrafia}</p>
                </div>
              </div>
            )}

            {/* Annotations */}
            {no.anotacoesCartorio && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <FileText className="size-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 text-xs">Anotações do Cartório</p>
                  <p className="text-orange-700 text-xs">{no.anotacoesCartorio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Status */}
          <div className="mt-3 pt-3 border-t border-navy/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status do Registro:</span>
              <Badge className={`text-[10px] ${
                no.statusRegistro === 'localizado' ? 'bg-green-100 text-green-800' :
                no.statusRegistro === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                no.statusRegistro === 'em_busca' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusRegistroLabel(no.statusRegistro)}
              </Badge>
            </div>
          </div>

          {/* Click to edit hint */}
          <p className="text-[10px] text-center text-muted-foreground mt-3 pt-2 border-t border-navy/5">
            Clique para editar este registro
          </p>
        </div>
      )}
    </div>
  );
}

// Couple row (husband and wife side by side) - SAME SIZE
function CoupleRow({ 
  homem, 
  mulher, 
  onEdit 
}: { 
  homem?: NoArvore; 
  mulher?: NoArvore; 
  onEdit: (no: NoArvore) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {homem ? (
        <PersonCard no={homem} onEdit={onEdit} />
      ) : (
        <EmptyCard label="Pai" />
      )}
      
      {(homem || mulher) && (
        <div className="w-5 h-px bg-gradient-to-r from-navy/30 to-transparent rounded" />
      )}
      
      {mulher ? (
        <PersonCard no={mulher} onEdit={onEdit} />
      ) : (
        <EmptyCard label="Mãe" />
      )}
    </div>
  );
}

// Empty card placeholder
function EmptyCard({ label }: { label: string }) {
  return (
    <Card className="border-dashed border-2 border-navy/20 bg-navy/[0.02] w-[155px] opacity-60">
      <CardContent className="p-3 text-center">
        <div className="mx-auto size-11 rounded-full bg-navy/5 flex items-center justify-center border-2 border-dashed border-navy/20">
          <Plus className="size-4 text-navy/30" />
        </div>
        <p className="text-xs text-navy/40 mt-2 font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

// Main Family Tree Component - Clean & Centered Layout
function FamilyTree({ 
  nos, 
  onEdit, 
  onAdd 
}: { 
  nos: NoArvore[]; 
  onEdit: (no: NoArvore) => void;
  onAdd: (relacao: string) => void;
}) {
  // Organize nodes by relationship
  const requerente = nos.find(n => n.relacao === 'requerente');
  const pai = nos.find(n => n.relacao === 'pai');
  const mae = nos.find(n => n.relacao === 'mae');
  const avoPaterno = nos.find(n => n.relacao === 'avo_paterno');
  const avoPaterna = nos.find(n => n.relacao === 'avo_paterna');
  const avoMaterno = nos.find(n => n.relacao === 'avo_materno');
  const avoMaterna = nos.find(n => n.relacao === 'avo_materna');
  const ancestrais = nos.filter(n => n.relacao === 'ancestral');

  const hasParents = !!(pai || mae);
  const hasGrandparents = !!(avoPaterno || avoPaterna || avoMaterno || avoMaterna);
  const hasAncestors = ancestrais.length > 0;

  return (
    <div className="py-10 overflow-x-auto">
      <div className="flex flex-col-reverse items-center gap-8 min-w-[500px]">
        
        {/* GENERATION 0: Requerente (BOTTOM) */}
        <div className="tree-node">
          {requerente ? (
            <PersonCard no={requerente} onEdit={onEdit} />
          ) : (
            <Card 
              className="cursor-pointer border-dashed border-2 border-navy/30 bg-navy/5 w-[155px] hover:bg-navy/10 transition-colors" 
              onClick={() => onAdd('requerente')}
            >
              <CardContent className="p-4 text-center">
                <User className="size-6 mx-auto text-navy/40" />
                <p className="text-sm font-medium text-navy/60 mt-2">Requerente</p>
                <p className="text-[10px] text-navy/40">Clique para adicionar</p>
              </CardContent>
            </Card>
          )}
          
          {/* Vertical line up from requerente */}
          {hasParents && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-t from-navy/20 to-navy/30" />
          )}
        </div>

        {/* Connector from Requerente to Parents */}
        {hasParents && (
          <div className="relative w-full max-w-md flex justify-center">
            {/* Horizontal bar */}
            <div className="absolute bottom-0 w-full max-w-[320px] h-0.5 bg-gradient-to-r from-transparent via-navy/25 to-transparent rounded-full" />
            
            {/* Vertical drops to parents */}
            <div className="absolute bottom-0 left-[calc(50%-90px)] w-0.5 h-4 bg-navy/25 translate-y-full" />
            <div className="absolute bottom-0 right-[calc(50%-90px)] w-0.5 h-4 bg-navy/25 translate-y-full" />
          </div>
        )}

        {/* GENERATION 1: Parents */}
        {hasParents && (
          <div className="relative tree-parents">
            <CoupleRow homem={pai} mulher={mae} onEdit={onEdit} />
            
            {/* Vertical lines up from parents */}
            {hasGrandparents && (
              <>
                <div className="absolute top-full left-[calc(50%-85px)] w-0.5 h-6 bg-gradient-to-t from-navy/15 to-navy/25" />
                <div className="absolute top-full right-[calc(50%-85px)] w-0.5 h-6 bg-gradient-to-t from-navy/15 to-navy/25" />
              </>
            )}
          </div>
        )}

        {/* Connector from Parents to Grandparents */}
        {hasGrandparents && hasParents && (
          <div className="relative w-full max-w-lg flex justify-center">
            {/* Left horizontal (paternal) */}
            <div className="absolute bottom-0 left-[calc(50%-200px)] w-[160px] h-0.5 bg-gradient-to-r from-transparent via-navy/20 to-transparent rounded-full" />
            <div className="absolute bottom-0 left-[calc(50%-280px)] w-0.5 h-4 bg-navy/20 translate-y-full" />
            <div className="absolute bottom-0 left-[calc(50%-120px)] w-0.5 h-4 bg-navy/20 translate-y-full" />
            
            {/* Right horizontal (maternal) */}
            <div className="absolute bottom-0 right-[calc(50%-200px)] w-[160px] h-0.5 bg-gradient-to-l from-transparent via-navy/20 to-transparent rounded-full" />
            <div className="absolute bottom-0 right-[calc(50%-280px)] w-0.5 h-4 bg-navy/20 translate-y-full" />
            <div className="absolute bottom-0 right-[calc(50%-120px)] w-0.5 h-4 bg-navy/20 translate-y-full" />
          </div>
        )}

        {/* GENERATION 2: Grandparents */}
        {hasGrandparents && (
          <div className="flex items-start justify-center gap-12 w-full max-w-xl">
            {/* Paternal grandparents */}
            <div className="flex flex-col items-center relative">
              {(avoPaterno || avoPaterna) ? (
                <CoupleRow homem={avoPaterno} mulher={avoPaterna} onEdit={onEdit} />
              ) : (
                <div className="flex gap-2 opacity-50">
                  <EmptyCard label="Avô Pat." />
                  <EmptyCard label="Avó Pat." />
                </div>
              )}
              
              {/* Line up to ancestors if exists */}
              {hasAncestors && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-navy/15 to-navy/20" />
              )}
            </div>
            
            {/* Maternal grandparents */}
            <div className="flex flex-col items-center relative">
              {(avoMaterno || avoMaterna) ? (
                <CoupleRow homem={avoMaterno} mulher={avoMaterna} onEdit={onEdit} />
              ) : (
                <div className="flex gap-2 opacity-50">
                  <EmptyCard label="Avô Mat." />
                  <EmptyCard label="Avó Mat." />
                </div>
              )}
              
              {/* Line up to ancestors if exists */}
              {hasAncestors && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-navy/15 to-navy/20" />
              )}
            </div>
          </div>
        )}

        {/* Ancestors section */}
        {hasAncestors && (
          <>
            {/* Horizontal connector for ancestors */}
            <div className="relative w-full max-w-lg flex justify-center">
              <div className="absolute bottom-0 w-full max-w-[280px] h-0.5 bg-gradient-to-r from-transparent via-navy/20 to-transparent rounded-full" />
            </div>
            
            <div className="flex flex-col items-center gap-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy/40">
                Ancestrais Europeus
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {ancestrais.map(ancestral => (
                  <PersonCard key={ancestral.id} no={ancestral} onEdit={onEdit} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
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
  
  // Controla qual zona de colar imagem está ativa (só uma por vez)
  const [zonaColarAtiva, setZonaColarAtiva] = useState<string | null>(null);
  
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
    setZonaColarAtiva(null);  // Resetar zona ativa ao abrir
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

          {/* Tree visualization - FamilySearch style */}
          <div className="bg-gradient-to-b from-navy/[0.02] to-transparent rounded-xl border border-navy/10 p-4 -m-4 min-h-[500px]">
            {cliente.arvore.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <TreePine className="size-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-serif text-lg font-600 text-navy mb-2">
                  Árvore Genealógica Vazia
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Adicione o requerente e membros da família para começar a montar a árvore genealógica no estilo FamilySearch.
                </p>
                <Button onClick={() => setDialogNovoNoAberto(true)} className="bg-navy hover:bg-navy-light">
                  <Plus className="size-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            ) : (
              <FamilyTree 
                nos={cliente.arvore} 
                onEdit={abrirEditarNo}
                onAdd={(relacao) => {
                  setNovoNoRelacao(relacao);
                  setDialogNovoNoAberto(true);
                }}
              />
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

      {/* Edit Node Modal - With Expandable Registry Sections */}
      <Dialog open={dialogNoAberto} onOpenChange={setDialogNoAberto}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-navy flex items-center gap-2">
              <User className="size-5" />
              Editar Membro da Família
            </DialogTitle>
            <DialogDescription>
              Atualize os dados pessoais e registros civis deste membro.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Nome Completo *</label>
              <Input
                value={formNo.nomeCompleto || ""}
                onChange={(e) => setFormNo({...formNo, nomeCompleto: e.target.value})}
                placeholder="Nome completo do membro"
              />
            </div>

            {/* Nascimento Section - Expandable */}
            <div className={`border rounded-lg overflow-hidden transition-all ${formNo.nascimento?.data ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
              {/* Section Header / Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!formNo.nascimento?.data) {
                    setFormNo({
                      ...formNo,
                      nascimento: { data: '', local: '', tipo: 'nascimento', completo: false }
                    });
                  } else {
                    const { nascimento, ...rest } = formNo;
                    setFormNo(rest);
                  }
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-green-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className={`size-5 ${formNo.nascimento?.data ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${formNo.nascimento?.data ? 'text-green-800' : 'text-gray-600'}`}>
                    Nascimento
                  </span>
                  {formNo.nascimento?.data && formNo.nascimento.completo && (
                    <CheckCircle2 className="size-4 text-green-600" />
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formNo.nascimento?.data 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {formNo.nascimento?.data ? 'Ativo' : '+ Adicionar'}
                </span>
              </button>

              {/* Expanded Content */}
              {formNo.nascimento && (
                <div className="p-3 pt-0 space-y-3 border-t border-green-200/50 mt-1">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-green-800">Data</label>
                      <Input
                        placeholder="DD/MM/YYYY"
                        value={formNo.nascimento.data || ""}
                        onChange={(e) => {
                          const newData = formatarData(e.target.value);
                          const hasAllFields = newData && formNo.nascimento.local;
                          setFormNo({
                            ...formNo,
                            nascimento: {...formNo.nascimento!, data: newData, completo: !!hasAllFields}
                          });
                        }}
                        maxLength={10}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-green-800">Local</label>
                      <Input
                        placeholder="Cidade, País"
                        value={formNo.nascimento.local || ""}
                        onChange={(e) => {
                          const hasAllFields = formNo.nascimento.data && e.target.value;
                          setFormNo({
                            ...formNo,
                            nascimento: {...formNo.nascimento!, local: e.target.value, completo: !!hasAllFields}
                          });
                        }}
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>

                  {/* Civil Registry Fields - with OCR Paste Zone */}
                  {(formNo.nascimento.data) && (
                    <div className="pt-2 space-y-3 bg-white rounded-md p-3 border border-green-200/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700 flex items-center gap-1">
                          <FileText className="size-3" /> Dados do Registro Civil
                        </p>
                      </div>
                      
                      {/* Image Paste Zone - OCR */}
                      <ImagePasteZone 
                        label="Cole aqui a imagem do registro (Ctrl+V)"
                        tipoRegistro="nascimento"
                        isActive={zonaColarAtiva === 'nascimento'}
                        onActivate={() => setZonaColarAtiva('nascimento')}
                        onDadosExtraidos={(dados) => {
                          console.log('Dados extraídos Nascimento:', dados);
                          
                          // Atualizar formNo com os dados extraídos
                          const novoRegistroCivil = {
                            ...(formNo.nascimento.registroCivil || {}),
                            cartorio: dados.cartorio || formNo.nascimento.registroCivil?.cartorio || '',
                            livro: dados.livro || formNo.nascimento.registroCivil?.livro || '',
                            folha: dados.folha || formNo.nascimento.registroCivil?.folha || '',
                            termo: dados.termo || formNo.nascimento.registroCivil?.termo || '',
                          };
                          
                          // Verificar se está completo
                          const temTodosCampos = novoRegistroCivil.cartorio || novoRegistroCivil.livro || novoRegistroCivil.folha || novoRegistroCivil.termo;
                          
                          setFormNo({
                            ...formNo,
                            nascimento: {
                              ...formNo.nascimento!,
                              local: dados.municipio ? `${dados.municipio}${dados.uf ? '/' + dados.uf : ''}` : formNo.nascimento.local,
                              registroCivil: novoRegistroCivil,
                              completo: !!(formNo.nascimento.data && temTodosCampos)
                            }
                          });
                        }}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Cartório</label>
                          <Input
                            placeholder="Nome do cartório"
                            value={formNo.nascimento.registroCivil?.cartorio || ''}
                            onChange={(e) => setFormNo({
                              ...formNo,
                              nascimento: {
                                ...formNo.nascimento!,
                                registroCivil: {...(formNo.nascimento.registroCivil || {}), cartorio: e.target.value}
                              }
                            })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Livro</label>
                          <Input
                            placeholder="Nº do livro"
                            value={formNo.nascimento.registroCivil?.livro || ''}
                            onChange={(e) => setFormNo({
                              ...formNo,
                              nascimento: {
                                ...formNo.nascimento!,
                                registroCivil: {...(formNo.nascimento.registroCivil || {}), livro: e.target.value}
                              }
                            })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Folha</label>
                          <Input
                            placeholder="Nº da folha"
                            value={formNo.nascimento.registroCivil?.folha || ''}
                            onChange={(e) => setFormNo({
                              ...formNo,
                              nascimento: {
                                ...formNo.nascimento!,
                                registroCivil: {...(formNo.nascimento.registroCivil || {}), folha: e.target.value}
                              }
                            })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Termo</label>
                          <Input
                            placeholder="Nº do termo"
                            value={formNo.nascimento.registroCivil?.termo || ''}
                            onChange={(e) => setFormNo({
                              ...formNo,
                              nascimento: {
                                ...formNo.nascimento!,
                                registroCivil: {...(formNo.nascimento.registroCivil || {}), termo: e.target.value}
                              }
                            })}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Casamento Section - Expandable */}
            <div className={`border rounded-lg overflow-hidden transition-all ${formNo.casamento?.data ? 'border-pink-300 bg-pink-50/30' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => {
                  if (!formNo.casamento?.data) {
                    setFormNo({
                      ...formNo,
                      casamento: { data: '', local: '', tipo: 'casamento', completo: false }
                    });
                  } else {
                    const { casamento, ...rest } = formNo;
                    setFormNo(rest);
                  }
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-pink-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className={`size-5 ${formNo.casamento?.data ? 'text-pink-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${formNo.casamento?.data ? 'text-pink-800' : 'text-gray-600'}`}>
                    Casamento
                  </span>
                  {formNo.casamento?.data && formNo.casamento.completo && (
                    <CheckCircle2 className="size-4 text-pink-600" />
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formNo.casamento?.data 
                    ? 'bg-pink-100 text-pink-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {formNo.casamento?.data ? 'Ativo' : '+ Adicionar'}
                </span>
              </button>

              {formNo.casamento && (
                <div className="p-3 pt-0 space-y-3 border-t border-pink-200/50 mt-1">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-pink-800">Data</label>
                      <Input
                        placeholder="DD/MM/YYYY"
                        value={formNo.casamento.data || ""}
                        onChange={(e) => {
                          const newData = formatarData(e.target.value);
                          const rc = formNo.casamento.registroCivil;
                          const hasRegistry = rc?.cartorio || rc?.livro || rc?.folha || rc?.termo;
                          setFormNo({
                            ...formNo,
                            casamento: {...formNo.casamento!, data: newData, completo: !!(newData && hasRegistry)}
                          });
                        }}
                        maxLength={10}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-pink-800">Local</label>
                      <Input
                        placeholder="Cidade, País"
                        value={formNo.casamento.local || ""}
                        onChange={(e) => setFormNo({...formNo, casamento: {...formNo.casamento!, local: e.target.value}})}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                  </div>

                  {/* Civil Registry Fields for Marriage - with OCR */}
                  {formNo.casamento.data && (
                    <div className="pt-2 space-y-3 bg-white rounded-md p-3 border border-pink-200/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-pink-700 flex items-center gap-1">
                          <FileText className="size-3" /> Dados do Registro Civil
                        </p>
                      </div>
                      
                      {/* Image Paste Zone - OCR */}
                      <ImagePasteZone 
                        label="Cole aqui a imagem do registro (Ctrl+V)"
                        tipoRegistro="casamento"
                        isActive={zonaColarAtiva === 'casamento'}
                        onActivate={() => setZonaColarAtiva('casamento')}
                        onDadosExtraidos={(dados) => {
                          console.log('Dados extraídos Casamento:', dados);
                          
                          const novoRegistroCivil = {
                            ...(formNo.casamento.registroCivil || {}),
                            cartorio: dados.cartorio || formNo.casamento.registroCivil?.cartorio || '',
                            livro: dados.livro || formNo.casamento.registroCivil?.livro || '',
                            folha: dados.folha || formNo.casamento.registroCivil?.folha || '',
                            termo: dados.termo || formNo.casamento.registroCivil?.termo || '',
                          };
                          
                          const temTodosCampos = novoRegistroCivil.cartorio || novoRegistroCivil.livro || novoRegistroCivil.folha || novoRegistroCivil.termo;
                          
                          setFormNo({
                            ...formNo,
                            casamento: {
                              ...formNo.casamento!,
                              local: dados.municipio ? `${dados.municipio}${dados.uf ? '/' + dados.uf : ''}` : formNo.casamento.local,
                              registroCivil: novoRegistroCivil,
                              completo: !!(formNo.casamento.data && temTodosCampos)
                            }
                          });
                        }}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Cartório</label>
                          <Input
                            placeholder="Nome do cartório"
                            value={formNo.casamento.registroCivil?.cartorio || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.casamento.registroCivil || {}), cartorio: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                casamento: {
                                  ...formNo.casamento!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.casamento.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Livro</label>
                          <Input
                            placeholder="Nº do livro"
                            value={formNo.casamento.registroCivil?.livro || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.casamento.registroCivil || {}), livro: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                casamento: {
                                  ...formNo.casamento!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.casamento.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Folha</label>
                          <Input
                            placeholder="Nº da folha"
                            value={formNo.casamento.registroCivil?.folha || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.casamento.registroCivil || {}), folha: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                casamento: {
                                  ...formNo.casamento!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.casamento.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Termo</label>
                          <Input
                            placeholder="Nº do termo"
                            value={formNo.casamento.registroCivil?.termo || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.casamento.registroCivil || {}), termo: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                casamento: {
                                  ...formNo.casamento!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.casamento.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Óbito Section - Expandable */}
            <div className={`border rounded-lg overflow-hidden transition-all ${formNo.obito?.data ? 'border-gray-400 bg-gray-50/50' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={() => {
                  if (!formNo.obito?.data) {
                    setFormNo({
                      ...formNo,
                      obito: { data: '', local: '', tipo: 'obito', completo: false }
                    });
                  } else {
                    const { obito, ...rest } = formNo;
                    setFormNo(rest);
                  }
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className={`size-5 ${formNo.obito?.data ? 'text-gray-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${formNo.obito?.data ? 'text-gray-800' : 'text-gray-600'}`}>
                    Óbito
                  </span>
                  {formNo.obito?.data && formNo.obito.completo && (
                    <CheckCircle2 className="size-4 text-gray-600" />
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  formNo.obito?.data 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {formNo.obito?.data ? 'Ativo' : '+ Adicionar'}
                </span>
              </button>

              {formNo.obito && (
                <div className="p-3 pt-0 space-y-3 border-t border-gray-300/50 mt-1">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-800">Data</label>
                      <Input
                        placeholder="DD/MM/YYYY"
                        value={formNo.obito.data || ""}
                        onChange={(e) => {
                          const newData = formatarData(e.target.value);
                          const rc = formNo.obito.registroCivil;
                          const hasRegistry = rc?.cartorio || rc?.livro || rc?.folha || rc?.termo;
                          setFormNo({
                            ...formNo,
                            obito: {...formNo.obito!, data: newData, completo: !!(newData && hasRegistry)}
                          });
                        }}
                        maxLength={10}
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-800">Local</label>
                      <Input
                        placeholder="Cidade, País"
                        value={formNo.obito.local || ""}
                        onChange={(e) => setFormNo({...formNo, obito: {...formNo.obito!, local: e.target.value}})}
                        className="border-gray-300 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  {/* Civil Registry Fields for Death - with OCR */}
                  {formNo.obito.data && (
                    <div className="pt-2 space-y-3 bg-white rounded-md p-3 border border-gray-300/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-700 flex items-center gap-1">
                          <FileText className="size-3" /> Dados do Registro Civil
                        </p>
                      </div>
                      
                      {/* Image Paste Zone - OCR */}
                      <ImagePasteZone 
                        label="Cole aqui a imagem do registro (Ctrl+V)"
                        tipoRegistro="obito"
                        isActive={zonaColarAtiva === 'obito'}
                        onActivate={() => setZonaColarAtiva('obito')}
                        onDadosExtraidos={(dados) => {
                          console.log('Dados extraídos Óbito:', dados);
                          
                          const novoRegistroCivil = {
                            ...(formNo.obito.registroCivil || {}),
                            cartorio: dados.cartorio || formNo.obito.registroCivil?.cartorio || '',
                            livro: dados.livro || formNo.obito.registroCivil?.livro || '',
                            folha: dados.folha || formNo.obito.registroCivil?.folha || '',
                            termo: dados.termo || formNo.obito.registroCivil?.termo || '',
                          };
                          
                          const temTodosCampos = novoRegistroCivil.cartorio || novoRegistroCivil.livro || novoRegistroCivil.folha || novoRegistroCivil.termo;
                          
                          setFormNo({
                            ...formNo,
                            obito: {
                              ...formNo.obito!,
                              local: dados.municipio ? `${dados.municipio}${dados.uf ? '/' + dados.uf : ''}` : formNo.obito.local,
                              registroCivil: novoRegistroCivil,
                              completo: !!(formNo.obito.data && temTodosCampos)
                            }
                          });
                        }}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Cartório</label>
                          <Input
                            placeholder="Nome do cartório"
                            value={formNo.obito.registroCivil?.cartorio || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.obito.registroCivil || {}), cartorio: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                obito: {
                                  ...formNo.obito!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.obito.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Livro</label>
                          <Input
                            placeholder="Nº do livro"
                            value={formNo.obito.registroCivil?.livro || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.obito.registroCivil || {}), livro: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                obito: {
                                  ...formNo.obito!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.obito.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Folha</label>
                          <Input
                            placeholder="Nº da folha"
                            value={formNo.obito.registroCivil?.folha || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.obito.registroCivil || {}), folha: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                obito: {
                                  ...formNo.obito!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.obito.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Termo</label>
                          <Input
                            placeholder="Nº do termo"
                            value={formNo.obito.registroCivil?.termo || ''}
                            onChange={(e) => {
                              const newRc = {...(formNo.obito.registroCivil || {}), termo: e.target.value};
                              const hasAnyField = Object.values(newRc).some(v => v);
                              setFormNo({
                                ...formNo,
                                obito: {
                                  ...formNo.obito!,
                                  registroCivil: newRc,
                                  completo: !!(formNo.obito.data && hasAnyField)
                                }
                              });
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status do Registro */}
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

            {/* Variações de Grafia */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Variações de Grafia do Nome</label>
              <Input
                placeholder="Ex: Müller, Mueller, Muller"
                value={formNo.variacoesGrafia || ""}
                onChange={(e) => setFormNo({...formNo, variacoesGrafia: e.target.value})}
              />
            </div>

            {/* Anotações de Cartório */}
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setDialogNoAberto(false);
                setZonaColarAtiva(null);  // Limpar zona ativa ao fechar
              }}>
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
