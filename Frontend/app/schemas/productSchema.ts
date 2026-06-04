import z from "zod";

export const productSchema = z
  .object({
    barcode: z.coerce.string().length(13, {
          message: "Barcode must be exactly 13 characters",
        }),

    name: z
      .string()
      .min(1, "Product name is required")
      .max(100, "Product name is too long"),

    weighted: z.union([z.boolean(), z.literal("")]),

    bulkPrice: z.coerce.number().min(0.01, "Bulk price must be greater than 0"),

    retailPrice: z.coerce
      .number()
      .min(0.01, "Retail price must be greater than 0"),

    packPrice: z.coerce.number().optional(),

    pricePerKg: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    // Product type validation
    if (data.weighted === "") {
      ctx.addIssue({
        code: "custom",
        path: ["weighted"],
        message: "Please select a product type",
      });
    }

    // Sausage product
    if (data.weighted === false) {
      if (!data.packPrice || data.packPrice <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["packPrice"],
          message: "Pack price is required",
        });
      }
    }

    // Chicken product
    if (data.weighted === true) {
      if (!data.pricePerKg || data.pricePerKg <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["pricePerKg"],
          message: "Price per Kg is required",
        });
      }
    }
  });

export type ProductSchema = z.infer<typeof productSchema>;
