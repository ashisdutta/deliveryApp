import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { string } from "zod";

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

    res.status(200).json({ success: true, data: restaurants });
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
      where: { id: id as string },
      include: {
        address: true,
        categories: {
          include: {
            menuItems: {
              where: {
                isDeleted: false,
                isAvailable: true, // Only show available items to customers
              },
            },
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
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch popular items",
        error: error.message,
      });
  }
};
