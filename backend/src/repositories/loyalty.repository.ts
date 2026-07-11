import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class LoyaltyRepository {
  async getHistory(customerId: string) {
    return prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addTransaction(data: Prisma.LoyaltyTransactionCreateInput) {
    return prisma.loyaltyTransaction.create({ data });
  }
}
