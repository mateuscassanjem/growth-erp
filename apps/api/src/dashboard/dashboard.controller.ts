import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestUser } from "../auth/auth.types";
import { CompanyStatusGuard } from "../companies/company-status.guard";
import { DashboardService } from "./dashboard.service";

@UseGuards(JwtAuthGuard, CompanyStatusGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("kpis")
  kpis(@CurrentUser() user: RequestUser) {
    return this.dashboard.kpis(user.companyId);
  }
}
