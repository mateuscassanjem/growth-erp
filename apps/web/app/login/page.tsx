"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useAuthStore } from "../../lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await login({ email: String(form.get("email")), password: String(form.get("password")) });
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input name="email" type="email" placeholder="Email" defaultValue="admin@growtherp.ao" required />
            <Input name="password" type="password" placeholder="Palavra-passe" defaultValue="Password123!" required />
            <Button className="w-full" disabled={loading}>
              {loading ? "A entrar..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-600">
            Ainda nao tem conta?{" "}
            <Link className="font-medium underline" href="/register">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
