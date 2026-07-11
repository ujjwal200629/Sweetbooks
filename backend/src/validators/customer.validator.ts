import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  birthday: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
