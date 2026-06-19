import { Injectable } from "@nestjs/common";
import { DashboardKpis } from "@growth/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async kpis(companyId: string): Promise<DashboardKpis> {
    const [customers, products, stock, invoices, revenue] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.product.aggregate({ where: { companyId }, _sum: { stock: true } }),
      this.prisma.invoice.count({ where: { companyId } }),
      this.prisma.invoice.aggregate({ where: { companyId }, _sum: { total: true } })
    ]);

    return {
      customers,
      products,
      stockUnits: stock._sum.stock ?? 0,
      invoices,
      revenue: Number(revenue._sum.total ?? 0)
    };
  }
}
