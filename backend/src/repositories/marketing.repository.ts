import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class MarketingRepository {
  async getAllOffers() {
    return prisma.offer.findMany({ orderBy: { startDate: "desc" } });
  }

  async createOffer(data: Prisma.OfferCreateInput) {
    return prisma.offer.create({ data });
  }

  async getAllCampaigns() {
    return prisma.campaign.findMany({ orderBy: { sentAt: "desc" } });
  }

  async createCampaign(data: Prisma.CampaignCreateInput) {
    return prisma.campaign.create({ data });
  }
}
