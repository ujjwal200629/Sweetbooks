import { prisma } from "../prisma/client";

export class OfferService {
  async getOffers() {
    return await prisma.offer.findMany({
      orderBy: { startDate: 'desc' }
    });
  }

  async getActiveOffers(customerVipLevel?: string) {
    const today = new Date();
    const activeOffers = await prisma.offer.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    if (!customerVipLevel) {
      // If no customer, only show offers that don't require VIP (or are empty array)
      return activeOffers.filter(o => !o.applicableVips || o.applicableVips.length === 0);
    }

    return activeOffers.filter(o => 
      !o.applicableVips || 
      o.applicableVips.length === 0 || 
      o.applicableVips.includes(customerVipLevel)
    );
  }

  async createOffer(data: any) {
    return await prisma.offer.create({
      data: {
        title: data.title,
        offerType: data.offerType,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumBill: data.minimumBill,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        applicableVips: data.applicableVips || []
      }
    });
  }

  async deleteOffer(id: string) {
    return await prisma.offer.delete({ where: { id } });
  }
}
