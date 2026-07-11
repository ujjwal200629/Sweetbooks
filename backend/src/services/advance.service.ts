import { AdvanceRepository } from "../repositories/advance.repository";
import { prisma } from "../prisma/client";

const advanceRepo = new AdvanceRepository();

export class AdvanceService {
  async getAllAdvanceOrders() {
    return advanceRepo.getAll();
  }

  async createAdvanceOrder(data: any) {
    // Calculate total amount
    let totalAmount = 0;
    for (const item of data.items) {
      totalAmount += item.quantity * item.price;
    }
    
    const remainingAmount = totalAmount - data.advancePaid;

    return await prisma.$transaction(async (tx) => {
      let customerId: string | undefined = undefined;

      if (data.customerPhone) {
        const name = data.customerName || "Walk-in Customer";
        let customer = await tx.customer.findUnique({ where: { phone: data.customerPhone } });
        if (!customer) {
          customer = await tx.customer.create({
            data: { 
              phone: data.customerPhone, 
              name,
              birthday: data.customerBirthday ? new Date(data.customerBirthday) : undefined,
              anniversary: data.customerAnniversary ? new Date(data.customerAnniversary) : undefined
            },
          });
        }
        customerId = customer.id;
      }

      if (!customerId) throw new Error("Customer Phone is required for Advance Orders.");

      const order = await tx.advanceOrder.create({
        data: {
          customerId: customerId,
          pickupDate: new Date(data.pickupDate),
          pickupTime: data.pickupTime,
          occasion: data.occasion,
          advancePaid: data.advancePaid,
          remainingAmount: remainingAmount,
          specialInstructions: data.specialInstructions,
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        },
        include: { items: true }
      });
      return order;
    });
  }

  async markAsCompleted(id: string) {
    return prisma.advanceOrder.update({
      where: { id },
      data: { status: "COMPLETED", remainingAmount: 0 }
    });
  }
}
