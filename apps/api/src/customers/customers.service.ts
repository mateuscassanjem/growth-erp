import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" }
    });
  }

  create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: { ...dto, companyId } });
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.ensureOwned(companyId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.ensureOwned(companyId, id);
    await this.prisma.customer.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureOwned(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id, companyId } });
    if (!customer) throw new NotFoundException("Customer not found");
  }
}
