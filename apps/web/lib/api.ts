import { AuthResponse, Customer, DashboardKpis, Invoice, Product } from "@growth/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Json = Record<string, unknown> | Array<unknown>;

export class ApiClient {
  constructor(private readonly getToken: () => string | null) {}

  login(payload: { email: string; password: string }) {
    return this.request<AuthResponse>("/api/auth/login", { method: "POST", body: payload, auth: false });
  }

  register(payload: { companyName: string; taxNumber?: string; name: string; email: string; password: string }) {
    return this.request<AuthResponse>("/api/auth/register", { method: "POST", body: payload, auth: false });
  }

  refresh(refreshToken: string) {
    return this.request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false
    });
  }

  logout() {
    return this.request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
  }

  me() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: string;
      company: {
        id: string;
        name: string;
        status: string;
      };
      currentSubscription: { status: string; plan: { name: string; code: string } } | null;
    }>("/api/me");
  }

  currentCompany() {
    return this.request<{
      id: string;
      name: string;
      status: string;
      taxNumber: string | null;
      currentSubscription: { status: string; plan: { name: string; code: string } } | null;
    }>("/api/companies/current");
  }

  updateCurrentCompany(payload: Record<string, string>) {
    return this.request("/api/companies/current", { method: "PATCH", body: payload });
  }

  kpis() {
    return this.request<DashboardKpis>("/api/dashboard/kpis");
  }

  customers() {
    return this.request<Customer[]>("/api/customers");
  }

  createCustomer(payload: Partial<Customer>) {
    return this.request<Customer>("/api/customers", { method: "POST", body: payload as Json });
  }

  products() {
    return this.request<Product[]>("/api/products");
  }

  createProduct(payload: { name: string; sku: string; price: number; stock: number }) {
    return this.request<Product>("/api/products", { method: "POST", body: payload });
  }

  invoices() {
    return this.request<Invoice[]>("/api/invoices");
  }

  createInvoice(payload: Json) {
    return this.request<Invoice>("/api/invoices", { method: "POST", body: payload });
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: Json; auth?: boolean } = {}
  ): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.auth === false || !token ? {} : { Authorization: `Bearer ${token}` })
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro inesperado" }));
      throw new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message);
    }

    return response.json() as Promise<T>;
  }
}
