"use client";

import { FormEvent, useEffect, useState } from "react";
import { Customer, Invoice, Product } from "@growth/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@growth/ui";
import { toast } from "sonner";
import { useApi } from "../../../lib/use-api";
import { useAuthStore } from "../../../lib/store";

export default function InvoicesPage() {
  const api = useApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const token = useAuthStore((state) => state.accessToken);

  async function load() {
    const [invoiceList, customerList, productList] = await Promise.all([
      api.invoices(),
      api.customers(),
      api.products()
    ]);
    setInvoices(invoiceList);
    setCustomers(customerList);
    setProducts(productList);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product = products.find((item) => item.id === String(form.get("productId")));
    if (!product) return toast.error("Escolha um produto");

    await api.createInvoice({
      customerId: String(form.get("customerId")),
      lines: [
        {
          productId: product.id,
          description: product.name,
          quantity: Number(form.get("quantity")),
          unitPrice: Number(product.price)
        }
      ]
    });
    event.currentTarget.reset();
    toast.success("Factura emitida");
    await load();
  }

  async function openPdf(invoiceId: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/api/invoices/${invoiceId}/pdf`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    if (!response.ok) return toast.error("Nao foi possivel abrir o PDF");
    const blob = await response.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Emitir factura</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <select className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" name="customerId" required>
              <option value="">Cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <select className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" name="productId" required>
              <option value="">Produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.stock} em stock
                </option>
              ))}
            </select>
            <Input name="quantity" placeholder="Quantidade" type="number" min="1" defaultValue="1" required />
            <Button className="w-full">Emitir</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-zinc-500">
                <tr>
                  <th className="py-2">Numero</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{invoice.number}</td>
                    <td>{invoice.status}</td>
                    <td>{Number(invoice.total).toLocaleString("pt-AO")} AOA</td>
                    <td>
                      <button className="text-sm font-medium underline" onClick={() => void openPdf(invoice.id)}>
                        Abrir
                      </button>
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
