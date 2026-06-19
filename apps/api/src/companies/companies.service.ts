import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCurrentCompanyDto } from "./dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async current(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        }
      }
    });
    if (!company) throw new NotFoundException("Company not found");
    return {
      ...company,
      currentSubscription: company.subscriptions[0] ?? null
    };
  }

  async updateCurrent(companyId: string, dto: UpdateCurrentCompanyDto) {
    await this.current(companyId);
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto
    });
  }
}
