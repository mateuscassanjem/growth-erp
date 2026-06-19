import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, companyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        lastCompanyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            taxNumber: true,
            email: true,
            phone: true,
            address: true,
            logoUrl: true,
            status: true,
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                status: true,
                startsAt: true,
                endsAt: true,
                plan: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    features: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) throw new NotFoundException("User not found");
    return {
      ...user,
      currentSubscription: user.company.subscriptions[0] ?? null
    };
  }
}
