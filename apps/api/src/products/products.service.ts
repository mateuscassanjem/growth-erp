import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto } from "./dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string) {
    return this.prisma.product.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
  }

  async create(companyId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: { ...dto, companyId, price: new Prisma.Decimal(dto.price) }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("SKU already exists for this company");
      }
      throw error;
    }
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    await this.ensureOwned(companyId, id);
    return this.prisma.product.update({
      where: { id },
      data: { ...dto, price: dto.price === undefined ? undefined : new Prisma.Decimal(dto.price) }
    });
  }

  async remove(companyId: string, id: string) {
    await this.ensureOwned(companyId, id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureOwned(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException("Product not found");
  }
}
