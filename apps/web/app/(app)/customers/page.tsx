"use client";

import { FormEvent, useEffect, useState } from "react";
import { Customer } from "@growth/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../../lib/use-api";

export default function CustomersPage() {
  const api = useApi();
  const [customers, setCustomers] = useState<Customer[]>([]);

  async function load() {
    setCustomers(await api.customers());
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.createCustomer(Object.fromEntries(form.entries()) as Partial<Customer>);
    event.currentTarget.reset();
    toast.success("Cliente criado");
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input name="name" placeholder="Nome" required />
            <Input name="email" placeholder="Email" type="email" />
            <Input name="phone" placeholder="Telefone" />
            <Input name="taxNumber" placeholder="NIF" />
            <Input name="address" placeholder="Endereco" />
            <Button className="w-full">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-zinc-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>NIF</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{customer.name}</td>
                    <td>{customer.email ?? "-"}</td>
                    <td>{customer.phone ?? "-"}</td>
                    <td>{customer.taxNumber ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
