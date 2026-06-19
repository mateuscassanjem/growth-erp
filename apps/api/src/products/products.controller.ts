import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestUser } from "../auth/auth.types";
import { CompanyStatusGuard } from "../companies/company-status.guard";
import { CreateProductDto, UpdateProductDto } from "./dto";
import { ProductsService } from "./products.service";

@UseGuards(JwtAuthGuard, CompanyStatusGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.products.findAll(user.companyId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateProductDto) {
    return this.products.create(user.companyId, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(user.companyId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.products.remove(user.companyId, id);
  }
}
