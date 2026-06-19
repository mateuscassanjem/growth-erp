import { Body, Controller, Get, Header, Param, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestUser } from "../auth/auth.types";
import { CompanyStatusGuard } from "../companies/company-status.guard";
import { CreateInvoiceDto } from "./dto";
import { InvoicesService } from "./invoices.service";

@UseGuards(JwtAuthGuard, CompanyStatusGuard)
@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.invoices.findAll(user.companyId);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateInvoiceDto) {
    return this.invoices.create(user.companyId, dto);
  }

  @Get(":id")
  findOne(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.invoices.findOne(user.companyId, id);
  }

  @Get(":id/pdf")
  @Header("Content-Type", "application/pdf")
  async pdf(@CurrentUser() user: RequestUser, @Param("id") id: string, @Res() res: Response) {
    const { buffer, fileName } = await this.invoices.pdf(user.companyId, id);
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.end(buffer);
  }
}
