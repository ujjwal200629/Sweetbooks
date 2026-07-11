import { Request, Response } from "express";
import { StockService } from "../services/stock.service";
import { adjustStockSchema } from "../validators/stock.validator";

const stockService = new StockService();

export class StockController {
  async getHistory(req: Request, res: Response) {
    try {
      const history = await stockService.getProductStockHistory(req.params.productId as string);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async adjust(req: Request, res: Response) {
    try {
      const parsedData = adjustStockSchema.parse(req.body);
      const result = await stockService.adjustStock(
        req.params.productId as string, 
        parsedData.quantityChange, 
        parsedData.reason
      );
      res.json({ success: true, message: "Stock adjusted", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }
}
