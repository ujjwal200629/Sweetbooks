import { Request, Response } from "express";
import { MarketingService } from "../services/marketing.service";
import { offerSchema, campaignSchema } from "../validators/marketing.validator";

const marketingService = new MarketingService();

export class MarketingController {
  async getOffers(req: Request, res: Response) {
    try {
      const offers = await marketingService.getOffers();
      res.json({ success: true, data: offers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createOffer(req: Request, res: Response) {
    try {
      const parsedData = offerSchema.parse(req.body);
      const result = await marketingService.createOffer(parsedData);
      res.status(201).json({ success: true, message: "Offer created", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async getCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await marketingService.getCampaigns();
      res.json({ success: true, data: campaigns });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createCampaign(req: Request, res: Response) {
    try {
      const parsedData = campaignSchema.parse(req.body);
      const result = await marketingService.createCampaign(parsedData);
      res.status(201).json({ success: true, message: "Campaign created and marked as sent", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }
}
