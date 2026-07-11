import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class CustomerRepository {
  async findAll() {
    return prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  }

  async findByPhone(phone: string) {
    return prisma.customer.findUnique({ where: { phone } });
  }

  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  }

  async getInvoices(customerId: string) {
    return prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }
    });
  }
}
