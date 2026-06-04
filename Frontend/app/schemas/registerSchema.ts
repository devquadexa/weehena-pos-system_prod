import { z } from "zod";

export const registerSchema = z
  .object({

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),

    role: z.enum(["ADMIN", "MANAGER", "CASHIER"], {
      message: "Please select a role",
    }),
  })
 .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;