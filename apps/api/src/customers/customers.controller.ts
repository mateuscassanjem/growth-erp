import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestUser } from "../auth/auth.types";
import { CompanyStatusGuard } from "../companies/company-status.guard";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto, CustomerQueryDto, UpdateCustomerDto } from "./dto";

@ApiTags("customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyStatusGuard)
@Controller("customers")
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: CustomerQueryDto) {
    return this.customers.findAll(user.companyId, query);
  }

  @Get(":id")
  findOne(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.customers.findOne(user.companyId, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(user.companyId, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(user.companyId, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.customers.remove(user.companyId, id);
  }
}
