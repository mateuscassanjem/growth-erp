"use client";

import { FormEvent, useEffect, useState } from "react";
import { Product } from "@growth/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../../lib/use-api";

export default function ProductsPage() {
  const api = useApi();
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    setProducts(await api.products());
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.createProduct({
      name: String(form.get("name")),
      sku: String(form.get("sku")),
      price: Number(form.get("price")),
      stock: Number(form.get("stock"))
    });
    event.currentTarget.reset();
    toast.success("Produto criado");
    await load();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Novo produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Input name="name" placeholder="Nome" required />
            <Input name="sku" placeholder="SKU" required />
            <Input name="price" placeholder="Preco" type="number" min="0" step="0.01" required />
            <Input name="stock" placeholder="Stock" type="number" min="0" required />
            <Button className="w-full">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-zinc-500">
                <tr>
                  <th className="py-2">Nome</th>
                  <th>SKU</th>
                  <th>Preco</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{Number(product.price).toLocaleString("pt-AO")} AOA</td>
                    <td>{product.stock}</td>
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
