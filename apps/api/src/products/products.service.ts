import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from "./dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string, query: ProductQueryDto = {}) {
    const search = query.search?.trim();
    return this.prisma.product.findMany({
      where: {
        companyId,
        active: query.active ?? true,
        ...(query.type ? { type: query.type } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: search, mode: Prisma.QueryMode.insensitive } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, companyId } });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async create(companyId: string, dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          companyId,
          type: dto.type ?? ProductType.PRODUCT,
          name: dto.name,
          sku: dto.sku || null,
          description: dto.description,
          price: new Prisma.Decimal(dto.price),
          stock: new Prisma.Decimal(dto.stock ?? 0),
          stockMinimum: new Prisma.Decimal(dto.stockMinimum ?? 0),
          taxRate: new Prisma.Decimal(dto.taxRate ?? 14),
          active: dto.active ?? true
        }
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
      data: {
        type: dto.type,
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        price: dto.price === undefined ? undefined : new Prisma.Decimal(dto.price),
        stock: dto.stock === undefined ? undefined : new Prisma.Decimal(dto.stock),
        stockMinimum: dto.stockMinimum === undefined ? undefined : new Prisma.Decimal(dto.stockMinimum),
        taxRate: dto.taxRate === undefined ? undefined : new Prisma.Decimal(dto.taxRate),
        active: dto.active
      }
    });
  }

  async remove(companyId: string, id: string) {
    await this.ensureOwned(companyId, id);
    await this.prisma.product.update({ where: { id }, data: { active: false } });
    return { ok: true };
  }

  private async ensureOwned(companyId: string, id: string) {
    await this.findOne(companyId, id);
  }
}
