import { z } from "zod";

// --- Enums ---
const RoleEnum = z.enum(["CUSTOMER", "RESTAURANT_OWNER", "SUPER_ADMIN"]);

// --- Schemas ---

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  role: RoleEnum.optional(),
  verificationToken: z.string().min(1, "Verification token is required"),
});

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  phone: z.string().optional(),
});

export const orderSchema = z.object({
  restaurantId: z.uuid({message:"Invalid Restaurant selection"}),
  addressId: z.uuid(),
  items: z.array(
    z.object({
      menuItemId: z.uuid("Invalid Menu Item"),
      quantity: z
          .number()
          .int("Quantity must be a whole number")
          .positive("Quantity must be at least 1"),
    })
  )
  .min(1, "Your cart cannot be empty"),
})


// --- TypeScript Type Exports ---

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
