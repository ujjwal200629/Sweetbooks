import { ProductRepository } from "../repositories/product.repository";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

const productRepo = new ProductRepository();

export class ProductService {
  async getAllProducts() {
    return productRepo.findAll();
  }

  async getProductById(id: string) {
    return productRepo.findById(id);
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return productRepo.create(data);
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return productRepo.update(id, data);
  }

  async deleteProduct(id: string) {
    return productRepo.delete(id);
  }

  async getProductAnalytics(id: string) {
    const stockHistory = await prisma.stockHistory.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const priceHistory = await prisma.productPriceHistory.findMany({
      where: { productId: id },
      orderBy: { updatedAt: "desc" },
      take: 20
    });

    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { productId: id },
      include: { invoice: true }
    });

    // Group sales frequency by date
    const salesData: Record<string, number> = {};
    invoiceItems.forEach((item: any) => {
      const dateStr = new Date(item.invoice.createdAt).toLocaleDateString("en-GB");
      if (!salesData[dateStr]) salesData[dateStr] = 0;
      salesData[dateStr] += item.quantity;
    });

    const salesFrequency = Object.keys(salesData).map(date => ({
      date,
      quantity: salesData[date]
    }));

    return {
      stockHistory,
      priceHistory,
      salesFrequency
    };
  }
}
