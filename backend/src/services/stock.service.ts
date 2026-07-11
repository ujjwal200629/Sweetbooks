import { StockRepository } from "../repositories/stock.repository";
import { ProductRepository } from "../repositories/product.repository";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

const stockRepo = new StockRepository();
const productRepo = new ProductRepository();

export class StockService {
  async getProductStockHistory(productId: string) {
    return stockRepo.getHistory(productId);
  }

  async adjustStock(productId: string, quantityChange: number, reason: string) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const newStock = product.stock + quantityChange;
      if (newStock < 0) throw new Error("Stock cannot be negative");

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      const changeType = quantityChange >= 0 ? "Addition" : "Deduction";

      return await tx.stockHistory.create({
        data: {
          productId,
          quantity: quantityChange,
          changeType,
          reason,
        }
      });
    });
  }
}
