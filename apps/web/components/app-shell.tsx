"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, FileText, LogOut, Users } from "lucide-react";
import { Button } from "@growth/ui";
import { useAuthStore } from "../lib/store";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Produtos", icon: Boxes },
  { href: "/invoices", label: "Facturas", icon: FileText }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white p-4 md:block">
        <div className="mb-8">
          <div className="text-xl font-bold">Growth ERP</div>
          <div className="mt-1 text-sm text-zinc-500">{user?.companyName ?? "Empresa"}</div>
        </div>
        <nav className="space-y-1">
          {(user?.companyStatus === "PENDING" ? items.filter((item) => item.href === "/dashboard") : items).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
                href={item.href}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          className="absolute bottom-4 left-4 right-4"
          variant="outline"
          onClick={() => {
            void logout();
            router.push("/");
          }}
        >
          <LogOut size={16} className="mr-2" />
          Sair
        </Button>
      </aside>
      <main className="p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
