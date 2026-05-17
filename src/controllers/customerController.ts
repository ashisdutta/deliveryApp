import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { string, success } from "zod";
import { ItemCategory } from "@prisma/client";
import { catchall } from "zod/mini";

// @desc    Get all open and approved restaurants
// @route   GET /api/customer/restaurants
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isOpen: true,
        isVerified: true,
        status: "APPROVED",
      },
      include: {
        address: true,
      },
    });

    res.status(200).json({ success: true, restaurants: restaurants });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
};

// @desc    Get a single restaurant with its categories and available menu items
// @route   GET /api/customer/restaurants/:id
export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: String(id) },
      include: {
        address: true,
        // FIX: We are querying 'menuItems' directly instead of going through 'categories'
        menuItems: {
          where: {
            isDeleted: false,
            isAvailable: true, // Only show available items to customers
          },
        },
      },
    });

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// @desc    Global search for restaurants and menu items
// @route   GET /api/customer/search?q=burger
export const searchMenu = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string;

    if (!searchQuery) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    // Run both queries concurrently for better performance
    const [restaurants, items] = await Promise.all([
      prisma.restaurant.findMany({
        where: {
          name: { contains: searchQuery, mode: "insensitive" },
          status: "APPROVED",
          isOpen: true,
        },
        take: 5,
      }),
      prisma.menuItem.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
          ],
          isDeleted: false,
          isAvailable: true,
        },
        include: {
          restaurant: {
            select: { name: true, id: true },
          },
        },
        take: 10,
      }),
    ]);

    res.status(200).json({ success: true, data: { restaurants, items } });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Search failed", error: error.message });
  }
};

// @desc    Get globally popular items for the horizontal scroll
// @route   GET /api/customer/popular-items
export const getPopularItems = async (req: Request, res: Response) => {
  try {
    // Fetches 10 available items. (In a real app, you'd sort by order count)
    const popularItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        isDeleted: false,
      },
      take: 10,
      include: {
        restaurant: {
          select: { name: true, id: true },
        },
      },
    });

    res.status(200).json({ success: true, data: popularItems });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular items",
      error: error.message,
    });
  }
};

export const getCategoryItems = async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    const allCategories = Object.values(ItemCategory);
    let items;

    // 1. If a category query is provided, validate and filter by it
    if (category) {
      const isValid = allCategories.includes(category as ItemCategory);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Please use one of: ${allCategories.join(", ")}`,
        });
      }

      items = await prisma.$queryRaw`
        SELECT * FROM "MenuItem"
        WHERE "category" = ${category}::"ItemCategory"
        AND "isDeleted" = false
        ORDER BY RANDOM()
        LIMIT 20
      `;
    } else {
      // 2. If NO category is provided ("All" tab), pull random items globally!
      items = await prisma.$queryRaw`
        SELECT * FROM "MenuItem"
        WHERE "isDeleted" = false
        ORDER BY RANDOM()
        LIMIT 15
      `;
    }

    return res.status(200).json({
      success: true,
      items
    });
  } catch (error) {
    console.error("Discovery Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all menu items for a specific restaurant
// @route   GET /api/customer/restaurants/:restaurantId/items
export const getRestaurantMenu = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;

  try {
    // 1. First verify if the restaurant exists and is active
    const restaurantExists = await prisma.restaurant.findUnique({
      where: { id: restaurantId as string},
      select: { id: true, isOpen: true }
    });

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // 2. Fetch all menu items linked to this restaurantId
    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurantId as string,
        isDeleted: false, // Don't show deleted dishes
      },
      orderBy: {
        name: "asc", // Alphabetical menu sorting
      },
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error: any) {
    console.error("Fetch Restaurant Menu Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching menu",
      error: error.message,
    });
  }
};