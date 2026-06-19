"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@growth/ui";
import { useAuthStore } from "../../lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Empresa criada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-zinc-600">
            {"A sua empresa est\u00e1 pendente de aprova\u00e7\u00e3o. Entraremos em contacto em breve."}
          </p>
          <p className="text-sm leading-6 text-zinc-600">
            Empresa: {user?.companyName ?? "Growth ERP"} · Plano: {user?.subscriptionPlan ?? "Free"}
          </p>
          <Button onClick={() => router.push("/dashboard")}>Ir para o dashboard</Button>
        </CardContent>
      </Card>
    </main>
  );
}
