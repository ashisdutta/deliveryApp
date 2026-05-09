

import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import request from "supertest";
import { app } from "../index.js";
import { prisma } from "../lib/prisma.js";

const OWNER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNGRhM2Q1MS0wMjU0LTQyOWUtOTljNy1jMDRiYWY1YzczMGQiLCJyb2xlIjoiUkVTVEFVUkFOVF9PV05FUiIsImlhdCI6MTc3NjQ0MDY5OCwiZXhwIjoxNzc5MDMyNjk4fQ.I_KpEsaw9JPq5YOAqxaNl0n7SUtVzh2mMJw_IRB868w";
const CUSTOMER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYWI2NTRjNi05MDM3LTQyNDYtOWUyZi05ZWNlYzYyMWU1YzkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzY0NDA3NjEsImV4cCI6MTc3OTAzMjc2MX0.aWS3soUsTwDEQXca2SXGMF2WZI5SqNH3PxGEIv7S4iA";


describe("Restaurant & Menu Management API", () => {
  let testRestaurantId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Optional: Check if JWT_SECRET is loaded
    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET not found in environment!");
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/restaurant/add-restaurant", () => {
    it("should fail if user is a CUSTOMER (Expected 403)", async () => {
      const res = await request(app)
        .post("/api/restaurant/add-restaurant")
        .set("Authorization", CUSTOMER_TOKEN)
        .send({ name: "Test Kitchen" });

      // If you get 401 here, your CUSTOMER_TOKEN is invalid/expired
      expect(res.statusCode).toBe(403);
    });

    it("should successfully create or find existing restaurant", async () => {
      const restaurantData = {
        name: "Jest Test Bistro",
        description: "Testing via Supertest",
        street: "123 Logic Lane",
        city: "Code City",
        state: "TS",
        zipCode: "10101",
        latitude: 12.34,
        longitude: 56.78,
        deliverySlabs: [{ minDistance: 0, maxDistance: 5, price: 20 }]
      };

      const res = await request(app)
        .post("/api/restaurant/add-restaurant")
        .set("Authorization", OWNER_TOKEN)
        .send(restaurantData);

      if (res.statusCode === 201) {
        testRestaurantId = res.body.newRestaurant.id;
      } else if (res.statusCode === 400 && res.body.message === "You already have a restaurant") {
        // Fallback: Get the existing ID if the user already owns one
        const existing = await prisma.restaurant.findFirst({
          where: { ownerId: "b9cba349-ffbc-4c92-965b-03b8d204d5d4" } // ID from your shared token
        });
        testRestaurantId = existing!.id;
      } else {
        // Log error if it's a 401 or 403 we didn't expect
        console.error("Setup failed:", res.body);
        throw new Error(`Expected 201 or 400, got ${res.statusCode}`);
      }
    });
  });

  describe("POST /api/restaurant/add-catagories", () => {
    it("should add a category", async () => {
      const res = await request(app)
        .post("/api/restaurant/add-catagories")
        .set("Authorization", OWNER_TOKEN)
        .send({
          name: "Desserts " + Date.now(),
          restaurantId: testRestaurantId
        });

      expect(res.statusCode).toBe(201);
      testCategoryId = res.body.newCatagory.id;
    });
  });

  describe("POST /api/restaurant/add-item", () => {
    it("should add a menu item", async () => {
      const res = await request(app)
        .post("/api/restaurant/add-item")
        .set("Authorization", OWNER_TOKEN)
        .send({
          name: "Chocolate Lava Cake",
          price: 150,
          categoryId: testCategoryId,
          restaurantId: testRestaurantId,
          isAvailable: true
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe("GET /api/restaurant/:id/items", () => {
    it("should fetch the list of items", async () => {
      const res = await request(app)
        .get(`/api/restaurant/${testRestaurantId}/items`)
        .set("Authorization", CUSTOMER_TOKEN);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("DELETE Operations", () => {
    it("should handle delete item logic", async () => {
      const fakeItemId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .delete(`/api/restaurant/delete-item/${fakeItemId}`)
        .set("Authorization", OWNER_TOKEN);

      // deleteMany returns 200 even if 0 items are deleted
      expect(res.statusCode).toBe(200);
    });
  });
});