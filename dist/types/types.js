import { z } from "zod";
// --- Enums ---
const RoleEnum = z.enum(["CUSTOMER", "RESTAURANT_OWNER", "SUPER_ADMIN"]);
// --- Schemas ---
export const sendOtpSchema = z.object({
    phone: z.string().min(10, "Valid phone number is required"),
});
export const verifyOtpSchema = z.object({
    phone: z.string().min(10, "Valid phone number is required"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    phone: z.string().optional(),
});
export const orderSchema = z.object({
    restaurantId: z.uuid({ message: "Invalid Restaurant selection" }),
    addressId: z.uuid(),
    items: z
        .array(z.object({
        menuItemId: z.uuid("Invalid Menu Item"),
        quantity: z
            .number()
            .int("Quantity must be a whole number")
            .positive("Quantity must be at least 1"),
    }))
        .min(1, "Your cart cannot be empty"),
});
export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().default("India"),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
    label: z.string().optional(), // e.g., "Home", "Office"
});
export const updateAddressSchema = addressSchema.partial();
export const createRestaurantSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    deliverySlabs: z
        .array(z.object({
        minDistance: z.number(),
        maxDistance: z.number(),
        price: z.number(),
    }))
        .min(1, "At least one delivery slab is required"),
});
export const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Category name is required")
        .max(50, "Category name is too long")
        .trim(),
    restaurantId: z.uuid("Invalid Restaurant ID"),
});
export const addItemSchema = z.object({
    name: z.string().min(1, "Item name is required").trim(),
    description: z.string().optional(),
    price: z.number().positive("Price must be a positive number"),
    imageUrl: z.url("Invalid image URL").optional().or(z.literal("")),
    categoryId: z.uuid("Invalid Category ID"),
    restaurantId: z.uuid("Invalid Restaurant ID"),
    isAvailable: z.boolean().default(true),
});
//# sourceMappingURL=types.js.map