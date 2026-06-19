import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthResponse } from "@growth/shared";
import { CompanyStatus, SubscriptionStatus, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./auth.types";
import { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException("Email already registered");

    const passwordHash = await hash(dto.password, 12);
    const result = await this.prisma.$transaction(async (tx) => {
      const freePlan = await tx.subscriptionPlan.upsert({
        where: { code: "FREE" },
        update: {},
        create: {
          code: "FREE",
          name: "Free",
          description: "Plano gratuito para beta controlado",
          price: 0,
          features: {
            users: 1,
            invoices: 25,
            customers: true,
            products: true
          }
        }
      });

      return tx.company.create({
        data: {
          name: dto.companyName,
          taxNumber: dto.taxNumber,
          status: CompanyStatus.PENDING,
          users: {
            create: {
              name: dto.name,
              email: dto.email.toLowerCase(),
              passwordHash,
              role: UserRole.OWNER
            }
          },
          subscriptions: {
            create: {
              planId: freePlan.id,
              status: SubscriptionStatus.FREE,
              startsAt: new Date()
            }
          }
        },
        include: { users: true }
      });
    });

    return this.issueTokens(result.users[0].id, true);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { company: true }
    });
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueTokens(user.id, true);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.verifyRefresh(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { company: true }
    });
    if (!user?.refreshTokenHash || !(await compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return this.issueTokens(user.id, true);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { ok: true };
  }

  private async issueTokens(userId: string, rotateRefreshToken: boolean): Promise<AuthResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        company: {
          include: {
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { plan: true }
            }
          }
        }
      }
    });
    const payload: JwtPayload = { sub: user.id, email: user.email, companyId: user.companyId };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET", "dev-access-secret"),
      expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m")
    });

    let refreshToken = "";
    if (rotateRefreshToken) {
      refreshToken = await this.jwt.signAsync(payload, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET", "dev-refresh-secret"),
        expiresIn: this.config.get<string>("JWT_REFRESH_TTL", "7d")
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: await hash(refreshToken, 12), lastCompanyId: user.companyId }
      });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        companyName: user.company.name,
        role: user.role,
        companyStatus: user.company.status,
        subscriptionPlan: user.company.subscriptions[0]?.plan.name ?? "Free",
        subscriptionStatus: user.company.subscriptions[0]?.status ?? "FREE"
      }
    };
  }

  private verifyRefresh(token: string) {
    return this.jwt.verifyAsync<JwtPayload>(token, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET", "dev-refresh-secret")
    });
  }
}
