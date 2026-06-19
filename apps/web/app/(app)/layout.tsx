"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@growth/ui";
import { AppShell } from "../../components/app-shell";
import { useAuthStore } from "../../lib/store";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!token) router.push("/");
  }, [router, token]);

  if (!token) return null;
  if (user?.companyStatus === "PENDING") {
    return (
      <AppShell>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{"Empresa pendente de aprova\u00e7\u00e3o"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-zinc-600">
              {"A sua empresa est\u00e1 pendente de aprova\u00e7\u00e3o. Entraremos em contacto em breve."}
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
