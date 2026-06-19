"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@growth/ui";
import { useApi } from "../../../lib/use-api";

type Me = Awaited<ReturnType<ReturnType<typeof useApi>["me"]>>;
type Company = Awaited<ReturnType<ReturnType<typeof useApi>["currentCompany"]>>;

export default function DashboardPage() {
  const api = useApi();
  const [me, setMe] = useState<Me | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    void Promise.all([api.me(), api.currentCompany()]).then(([user, currentCompany]) => {
      setMe(user);
      setCompany(currentCompany);
    });
  }, [api]);

  return (
    <section>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Info title="Empresa" value={company?.name ?? "-"} />
        <Info title="Estado da empresa" value={company?.status ?? "-"} />
        <Info title="Utilizador" value={me?.name ?? "-"} />
        <Info title="Plano atual" value={company?.currentSubscription?.plan.name ?? "Free"} />
      </div>
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-zinc-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
