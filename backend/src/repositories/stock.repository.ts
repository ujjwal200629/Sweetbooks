import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class StockRepository {
  async getHistory(productId: string) {
    return prisma.stockHistory.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addHistory(data: Prisma.StockHistoryCreateInput) {
    return prisma.stockHistory.create({ data });
  }
}
