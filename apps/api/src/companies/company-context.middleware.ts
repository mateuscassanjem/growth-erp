import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "../auth/auth.types";

export type CompanyContextRequest = Request & {
  activeCompanyId?: string;
};

@Injectable()
export class CompanyContextMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async use(req: CompanyContextRequest, _res: Response, next: NextFunction) {
    try {
      const token = this.extractBearerToken(req);
      if (!token) return next();

      const payload = await this.jwt
        .verifyAsync<JwtPayload>(token, {
          secret: this.config.get<string>("JWT_ACCESS_SECRET", "dev-access-secret")
        })
        .catch(() => null);
      if (!payload) return next();

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { companyId: true, lastCompanyId: true }
      });
      if (!user) return next();

      const header = req.header("x-company-id");
      if (header) {
        if (header !== user.companyId) {
          throw new ForbiddenException("Sem acesso a esta empresa.");
        }
        req.activeCompanyId = header;
        return next();
      }

      req.activeCompanyId = user.lastCompanyId === user.companyId ? user.lastCompanyId : user.companyId;
      next();
    } catch (error) {
      next(error);
    }
  }

  private extractBearerToken(req: Request) {
    const [type, token] = req.header("authorization")?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
