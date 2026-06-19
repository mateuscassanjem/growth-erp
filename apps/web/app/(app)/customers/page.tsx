"use client";

import { FormEvent, useEffect, useState } from "react";
import { Customer } from "@growth/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../../lib/use-api";

type CustomerForm = Pick<Customer, "name" | "email" | "phone" | "taxNumber" | "address">;

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  taxNumber: "",
  address: ""
};

export default function CustomersPage() {
  const api = useApi();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  async function load(nextSearch = search) {
    setCustomers(nextSearch ? await api.searchCustomers(nextSearch) : await api.customers());
  }

  useEffect(() => {
    void load("");
  }, []);

  function change<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(customer: Customer) {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      taxNumber: customer.taxNumber ?? "",
      address: customer.address ?? ""
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing) {
      await api.updateCustomer(editing.id, form);
      toast.success("Cliente atualizado");
    } else {
      await api.createCustomer(form);
      toast.success("Cliente criado");
    }
    setEditing(null);
    setForm(emptyForm);
    await load();
  }

  async function remove(customer: Customer) {
    await api.deleteCustomer(customer.id);
    toast.success("Cliente removido");
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Editar cliente" : "Novo cliente"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="Nome" required />
            <Input
              value={form.email ?? ""}
              onChange={(event) => change("email", event.target.value)}
              placeholder="Email"
              type="email"
            />
            <Input value={form.phone ?? ""} onChange={(event) => change("phone", event.target.value)} placeholder="Telefone" />
            <Input value={form.taxNumber ?? ""} onChange={(event) => change("taxNumber", event.target.value)} placeholder="NIF" />
            <Input value={form.address ?? ""} onChange={(event) => change("address", event.target.value)} placeholder="Endereco" />
            <div className="flex gap-2">
              <Button className="flex-1">{editing ? "Atualizar" : "Guardar"}</Button>
              {editing && (
                <Button
                  type="button"
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por nome, email, telefone ou NIF"
            />
            <Button type="button" variant="outline" onClick={() => void load(search)}>
              Pesquisar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-zinc-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>NIF</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{customer.name}</td>
                    <td>{customer.email ?? "-"}</td>
                    <td>{customer.phone ?? "-"}</td>
                    <td>{customer.taxNumber ?? "-"}</td>
                    <td className="space-x-2 text-right">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(customer)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void remove(customer)}>
                        Remover
                      </Button>
                    </td>
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
