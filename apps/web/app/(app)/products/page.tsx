"use client";

import { FormEvent, useEffect, useState } from "react";
import { Product } from "@growth/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../../lib/use-api";

type ProductForm = {
  name: string;
  sku: string;
  description: string;
  type: "PRODUCT" | "SERVICE";
  price: number;
  stock: number;
  stockMinimum: number;
  taxRate: number;
};

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  description: "",
  type: "PRODUCT",
  price: 0,
  stock: 0,
  stockMinimum: 0,
  taxRate: 14
};

export default function ProductsPage() {
  const api = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"PRODUCT" | "SERVICE" | "">("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  async function load() {
    setProducts(await api.searchProducts(search, type || undefined));
  }

  useEffect(() => {
    void load();
  }, []);

  function change<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      description: product.description ?? "",
      type: product.type,
      price: Number(product.price),
      stock: Number(product.stock),
      stockMinimum: Number(product.stockMinimum),
      taxRate: Number(product.taxRate)
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      sku: form.sku || undefined,
      stock: form.type === "SERVICE" ? 0 : form.stock,
      stockMinimum: form.type === "SERVICE" ? 0 : form.stockMinimum
    };
    if (editing) {
      await api.updateProduct(editing.id, payload);
      toast.success("Produto atualizado");
    } else {
      await api.createProduct(payload);
      toast.success("Produto criado");
    }
    setEditing(null);
    setForm(emptyForm);
    await load();
  }

  async function deactivate(product: Product) {
    await api.deleteProduct(product.id);
    toast.success("Produto desativado");
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Editar produto" : "Novo produto"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
              value={form.type}
              onChange={(event) => change("type", event.target.value as ProductForm["type"])}
            >
              <option value="PRODUCT">Produto</option>
              <option value="SERVICE">Servico</option>
            </select>
            <Input value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="Nome" required />
            <Input value={form.sku} onChange={(event) => change("sku", event.target.value)} placeholder="SKU opcional" />
            <Input
              value={form.description}
              onChange={(event) => change("description", event.target.value)}
              placeholder="Descricao"
            />
            <Input
              value={form.price}
              onChange={(event) => change("price", Number(event.target.value))}
              placeholder="Preco"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <Input
              value={form.taxRate}
              onChange={(event) => change("taxRate", Number(event.target.value))}
              placeholder="IVA"
              type="number"
              min="0"
              step="0.01"
            />
            {form.type === "PRODUCT" && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={form.stock}
                  onChange={(event) => change("stock", Number(event.target.value))}
                  placeholder="Stock"
                  type="number"
                  min="0"
                  step="0.001"
                />
                <Input
                  value={form.stockMinimum}
                  onChange={(event) => change("stockMinimum", Number(event.target.value))}
                  placeholder="Stock minimo"
                  type="number"
                  min="0"
                  step="0.001"
                />
              </div>
            )}
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
          <CardTitle>Produtos e servicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2 md:grid-cols-[1fr_160px_auto]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar" />
            <select
              className="h-10 rounded-md border border-zinc-200 px-3 text-sm"
              value={type}
              onChange={(event) => setType(event.target.value as typeof type)}
            >
              <option value="">Todos</option>
              <option value="PRODUCT">Produtos</option>
              <option value="SERVICE">Servicos</option>
            </select>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Filtrar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-zinc-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>Tipo</th>
                  <th>SKU</th>
                  <th>Preco</th>
                  <th>Stock</th>
                  <th>IVA</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{product.name}</td>
                    <td>{product.type === "PRODUCT" ? "Produto" : "Servico"}</td>
                    <td>{product.sku ?? "-"}</td>
                    <td>{Number(product.price).toLocaleString("pt-AO")} AOA</td>
                    <td>{product.type === "SERVICE" ? "-" : Number(product.stock).toLocaleString("pt-AO")}</td>
                    <td>{Number(product.taxRate)}%</td>
                    <td className="space-x-2 text-right">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(product)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void deactivate(product)}>
                        Desativar
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
