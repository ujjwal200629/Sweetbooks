import { Request, Response } from "express";
import { BillingService } from "../services/billing.service";
import { generateBillSchema } from "../validators/billing.validator";
import { ApiResponse } from "../server";

const billingService = new BillingService();

export class BillingController {
  async generate(req: Request, res: Response) {
    try {
      const parsedData = generateBillSchema.parse(req.body);
      const invoice = await billingService.generateBill(parsedData);
      res.status(201).json({ success: true, message: "Bill generated successfully", data: invoice } as ApiResponse);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ success: false, message: error.errors || error.message } as ApiResponse);
    }
  }
}
