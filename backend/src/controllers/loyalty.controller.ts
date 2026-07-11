import { Request, Response } from "express";
import { LoyaltyService } from "../services/loyalty.service";
import { redeemPointsSchema } from "../validators/loyalty.validator";

const loyaltyService = new LoyaltyService();

export class LoyaltyController {
  async getHistory(req: Request, res: Response) {
    try {
      const history = await loyaltyService.getCustomerLoyaltyHistory(req.params.customerId as string);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async redeem(req: Request, res: Response) {
    try {
      const parsedData = redeemPointsSchema.parse(req.body);
      const result = await loyaltyService.redeemPoints(
        req.params.customerId as string, 
        parsedData.points, 
        parsedData.reason
      );
      res.json({ success: true, message: "Points redeemed", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }
}
