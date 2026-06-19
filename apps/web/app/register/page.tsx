"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../lib/use-api";
import { useAuthStore } from "../../lib/store";

export default function RegisterPage() {
  const api = useApi();
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const session = await api.register({
        companyName: String(form.get("companyName")),
        taxNumber: String(form.get("taxNumber") || ""),
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      setSession(session);
      router.push("/onboarding");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel criar a conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Criar conta Growth ERP</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input name="companyName" placeholder="Nome da empresa" required />
            <Input name="taxNumber" placeholder="NIF" />
            <Input name="name" placeholder="Nome do utilizador" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Palavra-passe" minLength={8} required />
            <Button className="w-full" disabled={loading}>
              {loading ? "A criar..." : "Criar conta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-600">
            Ja tem conta?{" "}
            <Link className="font-medium underline" href="/login">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
