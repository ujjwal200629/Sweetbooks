import { LoyaltyRepository } from "../repositories/loyalty.repository";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

const loyaltyRepo = new LoyaltyRepository();

export class LoyaltyService {
  async getCustomerLoyaltyHistory(customerId: string) {
    return loyaltyRepo.getHistory(customerId);
  }

  async redeemPoints(customerId: string, points: number, reason: string) {
    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new Error("Customer not found");

      if (customer.loyaltyPoints < points) {
        throw new Error(`Insufficient loyalty points. Available: ${customer.loyaltyPoints}`);
      }

      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: customer.loyaltyPoints - points },
      });

      return await tx.loyaltyTransaction.create({
        data: {
          pointsRedeemed: points,
          customer: { connect: { id: customerId } }
        }
      });
    });
  }
}
