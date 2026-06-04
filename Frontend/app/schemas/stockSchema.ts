import { z } from "zod";

export const stockSchema = z
  .object({
    barcode: z.coerce.string().length(13, {
      message: "Barcode must be exactly 13 characters",
    }),

    outletId: z.string().min(1, { message: "Please select an outlet" }),

    weighted: z.boolean(),

    quantity: z.coerce.number(),

    weight: z.coerce.number(),

    lowStockThresholdQty: z.coerce.number(),

    lowStockThresholdWeight: z.coerce.number(),
  })
  .superRefine((data, ctx) => {
    if (data.weighted) {
      // Weighted product validations

      if (!data.weight || data.weight <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["weight"],
          message: "Weight must be greater than zero",
        });
      }

      if (!data.lowStockThresholdWeight || data.lowStockThresholdWeight <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["lowStockThresholdWeight"],
          message: "Low stock threshold weight must be greater than zero",
        });
      }
    } else {
      // Unit product validations

      if (!data.quantity || data.quantity <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Quantity must be greater than zero",
        });
      }

      if (!Number.isInteger(data.quantity)) {
        ctx.addIssue({
          code: "custom",
          path: ["quantity"],
          message: "Quantity must be an integer",
        });
      }

      if (!data.lowStockThresholdQty || data.lowStockThresholdQty <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["lowStockThresholdQty"],
          message: "Low stock threshold quantity must be greater than zero",
        });
      }

      if (
        data.lowStockThresholdQty &&
        !Number.isInteger(data.lowStockThresholdQty)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["lowStockThresholdQty"],
          message: "Low stock threshold quantity must be an integer",
        });
      }
    }
  });

export type StockSchema = z.infer<typeof stockSchema>;
