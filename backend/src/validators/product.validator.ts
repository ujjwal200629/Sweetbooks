import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be positive"),
  gst: z.number().min(0, "GST must be positive"),
  stock: z.number().min(0, "Stock cannot be negative").default(0),
  minimumStock: z.number().min(0).default(0),
  status: z.string().default("ACTIVE"),
});

export const updateProductSchema = createProductSchema.partial();
