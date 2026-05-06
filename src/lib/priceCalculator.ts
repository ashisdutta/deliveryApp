import { prisma } from "./prisma.js";

interface ItemInput {
    menuItemId: string;
    quantity: number;
}

/**
 * Haversine formula — returns straight-line distance between two
 * lat/lon coordinates in kilometres.
 */
function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
    ): number {
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => deg * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export const priceCalculator = async (
    restaurantId: string,
    items: ItemInput[],
    addressId: string
    ) => {
    // ── 1. Fetch all required data in parallel ──
    const [dbItems, restaurant, userAddress, deliverySlabs] = await Promise.all([
        prisma.menuItem.findMany({
        where: { id: { in: items.map((i) => i.menuItemId) }, restaurantId },
        }),
        prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: { address: true },
        }),
        prisma.address.findUnique({
        where: { id: addressId },
        }),
        prisma.deliverySlab.findMany({
        orderBy: { minDistance: "asc" },
        }),
    ]);

  // ── 2. Guard checks ──
    if (!restaurant) throw new Error("Restaurant not found.");
    if (!restaurant.address) throw new Error("Restaurant address not configured.");
    if (!userAddress) throw new Error("Delivery address not found.");

    if (
        restaurant.address.latitude == null ||
        restaurant.address.longitude == null ||
        userAddress.latitude == null ||
        userAddress.longitude == null
    ) {
        throw new Error("Latitude/longitude missing on one or both addresses.");
    }

    // Items validation: check every requested item was found in DB
    const missingItems = items.filter(
        (i) => !dbItems.find((d) => d.id === i.menuItemId)
    );
    if (missingItems.length > 0) {
        throw new Error(
        `The following items are unavailable: ${missingItems.map((i) => i.menuItemId).join(", ")}`
        );
    }

  // ── 3. Calculate subtotal ──
    let subTotal = 0;
    const orderItems = items.map((item) => {
        const dbItem = dbItems.find((d) => d.id === item.menuItemId)!;
        const priceAtBuy = dbItem.price;
        subTotal += priceAtBuy * item.quantity;

        return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtBuy,
        };
    });

    // ── 4. Calculate distance ──
    const distance = calculateHaversineDistance(
        restaurant.address.latitude,
        restaurant.address.longitude,
        userAddress.latitude,
        userAddress.longitude
    );

    // ── 5. Find matching global delivery slab ──
    // Range is left-inclusive, right-exclusive: minDistance <= distance < maxDistance
    // This is consistent with the delivery slab controller's distance query logic.
    const slab = deliverySlabs.find(
        (s) => distance >= s.minDistance && distance < s.maxDistance
    );

    if (!slab) {
        throw new Error(
        `No delivery slab found for a distance of ${distance.toFixed(2)} km. Delivery may not be available in your area.`
        );
    }

    // ── 6. Final price breakdown ──
    const deliveryFee = slab.price;
    const taxAmount = parseFloat((subTotal * 0.05).toFixed(2)); // 5% GST, rounded
    const discountAmount = 0; // Coupon logic can hook in here later
    const totalAmount = parseFloat(
        (subTotal + taxAmount + deliveryFee - discountAmount).toFixed(2)
    );

    return {
        subTotal,
        taxAmount,
        deliveryFee,
        discountAmount,
        totalAmount,
        distance: parseFloat(distance.toFixed(2)),
        orderItems,
    };
};