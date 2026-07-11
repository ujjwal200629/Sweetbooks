import { z } from "zod";

export const billingItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0.01),
  discount: z.number().default(0),
});

export const generateBillSchema = z.object({
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  customerBirthday: z.string().optional(),
  customerAnniversary: z.string().optional(),
  billingType: z.enum(["REGULAR", "ADVANCE"]).default("REGULAR"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]).default("CASH"),
  additionalCharges: z.number().default(0),
  globalDiscount: z.number().optional().default(0),
  billNotes: z.string().optional(),
  advanceOrderId: z.string().optional(),
  items: z.array(billingItemSchema).min(1, "At least one item is required"),
});
