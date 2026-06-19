import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { RequestUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CompaniesService } from "./companies.service";
import { UpdateCurrentCompanyDto } from "./dto";

@ApiTags("companies")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get("current")
  current(@CurrentUser() user: RequestUser) {
    return this.companies.current(user.companyId);
  }

  @Patch("current")
  updateCurrent(@CurrentUser() user: RequestUser, @Body() dto: UpdateCurrentCompanyDto) {
    return this.companies.updateCurrent(user.companyId, dto);
  }
}
