interface ItemInput {
    menuItemId: string;
    quantity: number;
}
export declare const priceCalculator: (restaurantId: string, items: ItemInput[], addressId: string) => Promise<{
    subTotal: number;
    taxAmount: number;
    deliveryFee: number;
    discountAmount: number;
    totalAmount: number;
    orderItems: {
        menuItemId: string;
        quantity: number;
        priceAtBuy: number;
    }[];
}>;
export {};
//# sourceMappingURL=priceCalculator.d.ts.map