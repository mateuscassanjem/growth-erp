import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 12);

  const company = await prisma.company.upsert({
    where: { id: "seed-company-growth" },
    update: {},
    create: {
      id: "seed-company-growth",
      name: "Growth Demo Angola",
      taxNumber: "5417000000",
      vatRate: 14
    }
  });

  const freePlan = await prisma.subscriptionPlan.upsert({
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

  await prisma.subscription.upsert({
    where: { id: "seed-subscription-free" },
    update: {},
    create: {
      id: "seed-subscription-free",
      companyId: company.id,
      planId: freePlan.id,
      status: "FREE",
      startsAt: new Date()
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@growtherp.ao" },
    update: { passwordHash },
    create: {
      companyId: company.id,
      email: "admin@growtherp.ao",
      name: "Administrador Growth",
      passwordHash
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      companyId: company.id,
      name: "Cliente Exemplo, Lda",
      email: "cliente@example.ao",
      phone: "+244 923 000 000",
      taxNumber: "5417000001",
      address: "Luanda, Angola"
    }
  });

  await prisma.product.upsert({
    where: { companyId_sku: { companyId: company.id, sku: "SERV-CONSULT" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Consultoria mensal",
      sku: "SERV-CONSULT",
      description: "Pacote mensal de consultoria de crescimento.",
      price: 150000,
      stock: 20
    }
  });

  console.log(`Seed complete for ${company.name} and ${customer.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
