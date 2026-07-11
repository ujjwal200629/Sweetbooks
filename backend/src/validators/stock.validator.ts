import { z } from "zod";

export const adjustStockSchema = z.object({
  quantityChange: z.number().refine((val) => val !== 0, "Quantity change cannot be zero"),
  reason: z.string().min(1, "Reason is required"),
});
