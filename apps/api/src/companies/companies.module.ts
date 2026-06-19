import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CompaniesController } from "./companies.controller";
import { CompanyStatusGuard } from "./company-status.guard";
import { CompaniesService } from "./companies.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyStatusGuard],
  exports: [CompaniesService, CompanyStatusGuard]
})
export class CompaniesModule {}
