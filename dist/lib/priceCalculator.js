import { prisma } from "./prisma.js";
export const priceCalculator = async (restaurantId, items, addressId) => {
    //1. Fetch the Menu Items and the Restaurant (with Address)
    const [dbItems, restaurant] = await Promise.all([
        prisma.menuItem.findMany({
            where: { id: { in: items.map((i) => i.menuItemId) }, restaurantId },
        }),
        prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { address: true, deliverySlabs: true },
        }),
    ]);
    if (!restaurant || !restaurant.address)
        throw new Error("Restaurant not found");
    if (dbItems.length !== items.length)
        throw new Error("Some items are unavailable");
    // 2. Calculate Subtotal and Prepare Items for the Order
    let subTotal = 0;
    const orderItems = items.map((item) => {
        const dbItem = dbItems.find((d) => d.id === item.menuItemId);
        const priceAtBuy = dbItem.price;
        subTotal += priceAtBuy * item.quantity;
        return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtBuy,
        };
    });
    // 3. Calculate Distance for Delivery Fee
    const userAddress = await prisma.address.findUnique({ where: { id: addressId } });
    if (!userAddress)
        throw new Error("Address not found");
    if (!restaurant.address.latitude ||
        !restaurant.address.longitude ||
        !userAddress.latitude ||
        !userAddress.longitude) {
        throw new Error("Invalid address");
    }
    const distance = calculateHaversineDistance(restaurant.address.latitude, restaurant.address.longitude, userAddress.latitude, userAddress.longitude);
    // 4. Find the matching Delivery Slab
    const slab = restaurant.deliverySlabs.find((s) => distance >= s.minDistance && distance <= s.maxDistance);
    if (!slab && restaurant.deliverySlabs.length > 0) {
        throw new Error("Restaurant does not deliver to this distance");
    }
    const deliveryFee = slab ? slab.price : 0;
    const taxAmount = subTotal * 0.05; // 5% GST
    const discountAmount = 0; // Logic for coupons can go here later
    const totalAmount = subTotal + taxAmount + deliveryFee - discountAmount;
    return {
        subTotal,
        taxAmount,
        deliveryFee,
        discountAmount,
        totalAmount,
        orderItems,
    };
};
// Math helper for distance
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
//# sourceMappingURL=priceCalculator.js.map