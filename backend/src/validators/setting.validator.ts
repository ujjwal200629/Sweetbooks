import { z } from "zod";

export const updateSettingSchema = z.object({
  shopName: z.string().min(1).optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
  invoicePrefix: z.string().optional(),
  goldSpending: z.number().optional(),
  goldVisits: z.number().optional(),
  platinumSpending: z.number().optional(),
  platinumVisits: z.number().optional(),
  diamondSpending: z.number().optional(),
  diamondVisits: z.number().optional(),
  pointsPerRupee: z.number().optional(),
  pointsRedemption: z.number().optional(),
});
