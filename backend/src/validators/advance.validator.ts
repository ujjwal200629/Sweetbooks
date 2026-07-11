import { z } from "zod";

export const advanceOrderSchema = z.object({
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  customerBirthday: z.string().optional(),
  customerAnniversary: z.string().optional(),
  pickupDate: z.string(), // YYYY-MM-DD
  pickupTime: z.string(), // HH:MM AM/PM
  occasion: z.string().optional(),
  advancePaid: z.number().min(0),
  specialInstructions: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(0.01),
    price: z.number().min(0),
  })).min(1),
});
