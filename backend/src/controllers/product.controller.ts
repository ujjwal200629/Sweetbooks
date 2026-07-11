import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { ProductService } from "../services/product.service";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { ApiResponse } from "../server";

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.json({ success: true, message: "Products fetched successfully", data: products } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as ApiResponse);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getProductById(req.params.id as string);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product fetched", data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsedData = createProductSchema.parse(req.body);
      const newProduct = await productService.createProduct(parsedData);
      res.status(201).json({ success: true, message: "Product created", data: newProduct });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsedData = updateProductSchema.parse(req.body);
      const updatedProduct = await productService.updateProduct(req.params.id as string, parsedData);
      res.json({ success: true, message: "Product updated", data: updatedProduct });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await productService.deleteProduct(req.params.id as string);
      res.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const data = await productService.getProductAnalytics(req.params.id as string);
      res.json({ success: true, message: "Analytics fetched", data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
