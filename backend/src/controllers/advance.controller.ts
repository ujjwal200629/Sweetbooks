import { Request, Response } from "express";
import { AdvanceService } from "../services/advance.service";
import { advanceOrderSchema } from "../validators/advance.validator";

const advanceService = new AdvanceService();

export class AdvanceController {
  async getAll(req: Request, res: Response) {
    try {
      const orders = await advanceService.getAllAdvanceOrders();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsedData = advanceOrderSchema.parse(req.body);
      const result = await advanceService.createAdvanceOrder(parsedData);
      res.status(201).json({ success: true, message: "Advance order created", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async complete(req: Request, res: Response) {
    try {
      const result = await advanceService.markAsCompleted(req.params.id as string);
      res.json({ success: true, message: "Advance order completed", data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
