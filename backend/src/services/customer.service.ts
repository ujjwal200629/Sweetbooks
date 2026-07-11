import { CustomerRepository } from "../repositories/customer.repository";
import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

const customerRepo = new CustomerRepository();

export class CustomerService {
  async getAllCustomers() {
    return customerRepo.findAll();
  }

  async getCustomerById(id: string) {
    return prisma.customer.findUnique({ 
      where: { id },
      include: { notes: { orderBy: { createdAt: "desc" } } }
    });
  }

  async getCustomerByPhone(phone: string) {
    return customerRepo.findByPhone(phone);
  }

  async createCustomer(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  async addNote(customerId: string, note: string, createdBy: string = "Owner") {
    return prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdBy
      }
    });
  }

  async updateCustomer(id: string, data: Prisma.CustomerUpdateInput) {
    return customerRepo.update(id, data);
  }

  // Helper for billing to auto-create customer if missing
  async findOrCreateCustomer(phone: string, name: string) {
    let customer = await customerRepo.findByPhone(phone);
    if (!customer) {
      customer = await customerRepo.create({ phone, name });
    }
    return customer;
  }

  async getCustomerInvoices(customerId: string) {
    return customerRepo.getInvoices(customerId);
  }
}
