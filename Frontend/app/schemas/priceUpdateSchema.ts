import { z } from "zod";

export const priceUpdateSchema = z.object({
  bulkPrice: z.number().min(0.01, "Bulk price must be greater than 0"),
  retailPrice: z.number().min(0.01, "Retail price must be greater than 0"),
  packPrice: z.number().min(0.01, "Pack price must be greater than 0"),
  pricePerKg: z.number().min(0.01, "Price per kg must be greater than 0"),
});

export type PriceUpdateSchema = z.infer<typeof priceUpdateSchema>;
