import { z } from "zod";

export const offerSchema = z.object({
  title: z.string().min(1),
  offerType: z.string().min(1),
  discountType: z.string().min(1),
  discountValue: z.number().min(0),
  minimumBill: z.number().min(0),
  startDate: z.string(),
  endDate: z.string(),
});

export const campaignSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  recipientType: z.string().min(1),
});
