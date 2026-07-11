import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class AdvanceRepository {
  async getAll() {
    return prisma.advanceOrder.findMany({
      include: {
        customer: true,
        items: { include: { product: true } }
      },
      orderBy: { pickupDate: "asc" }
    });
  }

  async getById(id: string) {
    return prisma.advanceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
  }
}
