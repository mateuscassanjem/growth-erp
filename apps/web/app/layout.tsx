import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth ERP",
  description: "SaaS ERP para PME angolanas"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
