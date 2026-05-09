// import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
// import request from "supertest";
// import { app } from "../index.js";
// import { prisma } from "../lib/prisma.js";

// const CUSTOMER_TOKEN = "Bearer PASTE_YOUR_CUSTOMER_TOKEN_HERE";

// describe("Order Lifecycle API", () => {
//   let testOrderId: string;
//   let testRestaurantId: string;
//   let testAddressId: string;
//   let testItemId: string;

//   beforeAll(async () => {
//     // We need to fetch real IDs from your DB to place a valid order
//     const restaurant = await prisma.restaurant.findFirst({ include: { items: true, address: true } });
//     const address = await prisma.address.findFirst();
    
//     if (!restaurant || !address || restaurant.items.length === 0) {
//       throw new Error("Setup failed: Ensure you have at least one restaurant with items and one address in DB.");
//     }

//     testRestaurantId = restaurant.id;
//     testItemId = restaurant.items[0].id;
//     testAddressId = address.id;
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   describe("POST /api/order", () => {
//     it("should place a new order successfully", async () => {
//       const orderData = {
//         restaurantId: testRestaurantId,
//         addressId: testAddressId,
//         items: [
//           { menuItemId: testItemId, quantity: 2 }
//         ]
//       };

//       const res = await request(app)
//         .post("/api/order")
//         .set("Authorization", CUSTOMER_TOKEN)
//         .send(orderData);

//       expect(res.statusCode).toBe(201);
//       expect(res.body.message).toBe("Order placed successfully");
//       expect(res.body.order).toHaveProperty("id");
//       testOrderId = res.body.order.id;
//     });

//     it("should return 400 for invalid inputs (empty items)", async () => {
//       const res = await request(app)
//         .post("/api/order")
//         .set("Authorization", CUSTOMER_TOKEN)
//         .send({ restaurantId: testRestaurantId, addressId: testAddressId, items: [] });

//       expect(res.statusCode).toBe(400);
//     });
//   });

//   describe("GET /api/order/history", () => {
//     it("should fetch user order history", async () => {
//       const res = await request(app)
//         .get("/api/order/history")
//         .set("Authorization", CUSTOMER_TOKEN);

//       expect(res.statusCode).toBe(200);
//       expect(Array.isArray(res.body.orders)).toBe(true);
//       expect(res.body.orders.length).toBeGreaterThan(0);
//     });
//   });

//   describe("GET /api/order/:id", () => {
//     it("should fetch specific order details", async () => {
//       const res = await request(app)
//         .get(`/api/order/${testOrderId}`)
//         .set("Authorization", CUSTOMER_TOKEN);

//       expect(res.statusCode).toBe(200);
//       expect(res.body.orderDetails.id).toBe(testOrderId);
//     });

//     it("should return 411 if order doesn't exist", async () => {
//       const fakeId = "00000000-0000-0000-0000-000000000000";
//       const res = await request(app)
//         .get(`/api/order/${fakeId}`)
//         .set("Authorization", CUSTOMER_TOKEN);

//       expect(res.statusCode).toBe(411);
//     });
//   });

//   describe("PATCH /api/order/:id/cancel", () => {
//     it("should cancel a pending order", async () => {
//       const res = await request(app)
//         .patch(`/api/order/${testOrderId}/cancel`)
//         .set("Authorization", CUSTOMER_TOKEN);

//       expect(res.statusCode).toBe(200);
//       expect(res.body.order.status).toBe("CANCELLED");
//     });

//     it("should fail to cancel an already cancelled order", async () => {
//       const res = await request(app)
//         .patch(`/api/order/${testOrderId}/cancel`)
//         .set("Authorization", CUSTOMER_TOKEN);

//       expect(res.statusCode).toBe(400);
//       expect(res.body.message).toBe("Order already cancelled");
//     });
//   });
// });