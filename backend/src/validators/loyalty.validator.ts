import { z } from "zod";

export const redeemPointsSchema = z.object({
  points: z.number().min(1, "Points must be positive"),
  reason: z.string().min(1, "Reason is required"),
});
