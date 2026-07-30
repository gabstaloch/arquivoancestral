"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  TreePine,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/crm-store";

interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Check authentication
    const auth = isAuthenticated();
    setAutenticado(auth);
    setVerificando(false);

    if (!auth) {
      router.push("/login");
    }
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/painel/login");
  }

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-navy/20 border-t-navy rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo area */}
        <div className="p-5 border-b border-white/10">
          <Link href="/painel" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="relative size-10 shrink-0">
              <Image
                src="/logo-arquivo-ancestral.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-base font-700 leading-tight">Arquivo Ancestral</h1>
              <p className="text-[10px] uppercase tracking-wider text-gold/80">Painel de Gestão</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/painel"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LayoutDashboard className="size-5" />
            <span className="font-medium">Lista de Clientes</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-3 text-[10px] uppercase tracking-wider text-white/40 mb-2">Sistema</p>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="size-5" />
              <span className="font-medium">Sair do Painel</span>
            </button>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 text-center">
            v1.0.0 • Arquivo Ancestral © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border px-4 sm:px-6 h-16 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-navy"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <TreePine className="size-4 text-gold-dark" />
              <span>Gestão de Pedidos & Pesquisa Genealógica</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-navy">
                <ArrowLeft className="size-4 mr-1" />
                Ver Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
