import { z } from "zod";
export declare const sendOtpSchema: z.ZodObject<{
    phone: z.ZodString;
}, z.core.$strip>;
export declare const verifyOtpSchema: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const orderSchema: z.ZodObject<{
    restaurantId: z.ZodUUID;
    addressId: z.ZodUUID;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodUUID;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const addressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    label: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAddressSchema: z.ZodObject<{
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zipCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    label: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const createRestaurantSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zipCode: z.ZodString;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    deliverySlabs: z.ZodArray<z.ZodObject<{
        minDistance: z.ZodNumber;
        maxDistance: z.ZodNumber;
        price: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    restaurantId: z.ZodUUID;
}, z.core.$strip>;
export declare const addItemSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    imageUrl: z.ZodUnion<[z.ZodOptional<z.ZodURL>, z.ZodLiteral<"">]>;
    categoryId: z.ZodUUID;
    restaurantId: z.ZodUUID;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
//# sourceMappingURL=types.d.ts.map