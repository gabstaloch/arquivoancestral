"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, AlertCircle, TreePine } from "lucide-react";
import { login } from "@/lib/crm-store";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Simulate loading for UX
    await new Promise((r) => setTimeout(r, 800));

    if (login(senha)) {
      router.push("/painel");
    } else {
      setErro("Senha incorreta. Tente novamente.");
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-navy/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-navy/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-xl shadow-navy/10 border-navy/10">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative size-20">
              <Image
                src="/logo-arquivo-ancestral.png"
                alt="Arquivo Ancestral Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          
          <CardTitle className="font-serif text-2xl font-700 text-navy">
            ARQUIVO ANCESTRAL
          </CardTitle>
          <CardDescription className="text-muted-foreground flex items-center justify-center gap-1.5 mt-2">
            <Lock className="size-4 text-gold-dark" />
            Acesso Restrito ao Pesquisador
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {erro && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                {erro}
              </div>
            )}

            {/* Usuario field */}
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-navy font-medium">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="pl-10 border-navy/20 focus:border-gold"
                  required
                />
              </div>
            </div>

            {/* Senha field */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-navy font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 border-navy/20 focus:border-gold"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-navy hover:bg-navy-light text-white font-600 py-2.5"
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <TreePine className="size-4" />
                  Acessar Painel
                </span>
              )}
            </Button>
          </form>

          {/* Footer info */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sistema de Gestão Interna • Arquivo Ancestral © {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
