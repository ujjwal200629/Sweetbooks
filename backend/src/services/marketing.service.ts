import { MarketingRepository } from "../repositories/marketing.repository";

const marketingRepo = new MarketingRepository();

export class MarketingService {
  async getOffers() {
    return marketingRepo.getAllOffers();
  }

  async createOffer(data: any) {
    return marketingRepo.createOffer({
      title: data.title,
      offerType: data.offerType,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumBill: data.minimumBill,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  async getCampaigns() {
    return marketingRepo.getAllCampaigns();
  }

  async createCampaign(data: any) {
    return marketingRepo.createCampaign({
      title: data.title,
      message: data.message,
      recipientType: data.recipientType,
      status: "SENT",
      sentAt: new Date(),
    });
  }
}
