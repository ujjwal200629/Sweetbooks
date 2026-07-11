import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class InvoiceRepository {
  async create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({
      data,
      include: { items: true, customer: true },
    });
  }

  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: true },
    });
  }
}
