import { z } from "zod";

// --- Enums ---
const RoleEnum = z.enum(["CUSTOMER", "RESTAURANT_OWNER", "SUPER_ADMIN"]);

// --- Schemas ---

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  role: RoleEnum.optional(),

  //controller extracts the email securely from the 'verify_token' cookie.
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  phone: z.string().optional(),
});

// --- TypeScript Type Exports ---
// Extracting these types allows to use them elsewhere in your frontend or backend logic

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
