import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { CompanyStatus } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../auth/auth.types";
import { PrismaService } from "../prisma/prisma.service";

type GuardRequest = Request & {
  user?: RequestUser;
  activeCompanyId?: string;
};

@Injectable()
export class CompanyStatusGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<GuardRequest>();
    const user = request.user;
    if (!user) return true;

    if (this.isAllowedWhilePending(request)) return true;

    const companyId = request.activeCompanyId ?? user.companyId;
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { status: true }
    });

    if (company?.status !== CompanyStatus.ACTIVE) {
      throw new ForbiddenException("Empresa pendente de aprova\u00e7\u00e3o.");
    }

    return true;
  }

  private isAllowedWhilePending(request: GuardRequest) {
    const path = request.path.replace(/^\/api/, "");
    const method = request.method.toUpperCase();

    return (
      (method === "GET" && path === "/me") ||
      (method === "GET" && path === "/companies/current") ||
      (method === "PATCH" && path === "/companies/current") ||
      (method === "POST" && path === "/auth/logout")
    );
  }
}
