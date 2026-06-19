import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { fiscalInvoiceNumber } from "@growth/shared";
import PDFDocument from "pdfkit";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { customer: true, lines: true },
      orderBy: { issuedAt: "desc" }
    });
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { company: true, customer: true, lines: true }
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  async create(companyId: string, dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, companyId } });
    if (!customer) throw new NotFoundException("Customer not found");

    const company = await this.prisma.company.findUniqueOrThrow({ where: { id: companyId } });
    const lines = dto.lines.map((line) => {
      const vatRate = line.vatRate ?? Number(company.vatRate);
      const subtotal = line.quantity * line.unitPrice;
      const vat = subtotal * (vatRate / 100);
      return {
        ...line,
        vatRate,
        lineTotal: subtotal + vat
      };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const vatTotal = total - subtotal;

    return this.prisma.$transaction(async (tx) => {
      for (const line of lines) {
        if (!line.productId) continue;
        const product = await tx.product.findFirst({ where: { id: line.productId, companyId } });
        if (!product) throw new NotFoundException(`Product not found: ${line.productId}`);
        if (Number(product.stock) < line.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: line.quantity } }
        });
      }

      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: { invoiceSequence: { increment: 1 } }
      });
      const number = fiscalInvoiceNumber(new Date().getFullYear(), updatedCompany.invoiceSequence);

      return tx.invoice.create({
        data: {
          companyId,
          customerId: dto.customerId,
          number,
          series: "A",
          status: InvoiceStatus.ISSUED,
          issuedAt: new Date(),
          subtotal: new Prisma.Decimal(subtotal),
          vatTotal: new Prisma.Decimal(vatTotal),
          total: new Prisma.Decimal(total),
          lines: {
            create: lines.map((line) => ({
              companyId,
              productId: line.productId,
              description: line.description,
              quantity: new Prisma.Decimal(line.quantity),
              unitPrice: new Prisma.Decimal(line.unitPrice),
              vatRate: new Prisma.Decimal(line.vatRate),
              taxAmount: new Prisma.Decimal(line.quantity * line.unitPrice * (line.vatRate / 100)),
              lineTotal: new Prisma.Decimal(line.lineTotal)
            }))
          }
        },
        include: { customer: true, lines: true }
      });
    });
  }

  async pdf(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);
    const buffer = await new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({ margin: 48 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text("Growth ERP", { align: "right" });
      doc.fontSize(14).text(`Factura ${invoice.number}`);
      doc.moveDown();
      doc.fontSize(10).text(`Empresa: ${invoice.company.name}`);
      doc.text(`NIF: ${invoice.company.taxNumber ?? "-"}`);
      doc.text(`Cliente: ${invoice.customer?.name ?? "Consumidor final"}`);
      doc.text(`Data: ${(invoice.issuedAt ?? invoice.createdAt).toISOString().slice(0, 10)}`);
      doc.moveDown();

      invoice.lines.forEach((line) => {
        doc.text(
          `${line.description} | Qtd: ${line.quantity} | Unit: ${line.unitPrice} | IVA: ${line.vatRate}% | Total: ${line.lineTotal}`
        );
      });

      doc.moveDown();
      doc.text(`Subtotal: ${invoice.subtotal} AOA`, { align: "right" });
      doc.text(`IVA: ${invoice.vatTotal} AOA`, { align: "right" });
      doc.fontSize(14).text(`Total: ${invoice.total} AOA`, { align: "right" });
      doc.end();
    });

    return { buffer, fileName: `factura-${(invoice.number ?? invoice.id).replaceAll("/", "-")}.pdf` };
  }
}
