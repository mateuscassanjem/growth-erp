export type ID = string;

export type AuthUser = {
  id: ID;
  email: string;
  name: string;
  companyId: ID;
  companyName: string;
  role: "OWNER" | "MANAGER" | "CASHIER" | "ADMIN";
  companyStatus: "PENDING" | "ACTIVE" | "SUSPENDED";
  subscriptionPlan: string;
  subscriptionStatus: "FREE" | "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type Customer = {
  id: ID;
  name: string;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  address: string | null;
  createdAt: string;
};

export type Product = {
  id: ID;
  type: "PRODUCT" | "SERVICE";
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  stock: number;
  stockMinimum: number;
  taxRate: number;
  active: boolean;
  createdAt: string;
};

export type InvoiceLine = {
  productId: ID;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type Invoice = {
  id: ID;
  number: string | null;
  customerId: ID | null;
  subtotal: number;
  vatTotal: number;
  total: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  issuedAt: string | null;
};

export type DashboardKpis = {
  customers: number;
  products: number;
  stockUnits: number;
  invoices: number;
  revenue: number;
};

export const fiscalInvoiceNumber = (year: number, sequence: number) =>
  `A/${year}/${String(sequence).padStart(6, "0")}`;
