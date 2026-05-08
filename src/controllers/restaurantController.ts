import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { createRestaurantSchema, addItemSchema } from "../types/types.js";
import { ItemCategory } from "@prisma/client";

export const addRestaurant = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = createRestaurantSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid inputs",
      errors: result.error.issues,
    });
  }

  const {
    name,
    description,
    street,
    city,
    state,
    zipCode,
    latitude,
    longitude,
  } = result.data;

  try {
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description ?? null,
        ownerId: userId,
        address: {
          create: {
            street,
            city,
            state,
            zipCode,
            latitude,
            longitude,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Restaurant created successfully", newRestaurant });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create restaurant" });
  }
};

export const addItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = addItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid inputs",
      errors: result.error.issues,
    });
  }
  const {
    name,
    description,
    price,
    imageUrl,
    category,
    restaurantId,
    isAvailable,
  } = result.data;

  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: userId,
      },
    });

    if (!restaurant) {
      return res
        .status(403)
        .json({ message: "You do not own this restaurant" });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description: description ?? null,
        price,
        imageUrl: imageUrl ?? null,
        category,
        restaurantId,
        isAvailable,
      },
    });

    return res
      .status(201)
      .json({ message: "Item created successfully", newItem });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create Item" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = req.params.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const deleteOperation = await prisma.menuItem.deleteMany({
      where: {
        id: itemId as string,
        restaurant: {
          ownerId: userId,
        },
      },
    });
    return res
      .status(200)
      .json({ message: " Item deleted successfully", deleteOperation });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete Item" });
  }
};

/**
 * Fetches all menu items for a specific restaurant.
 * Route: GET /api/restaurants/:id/items
 * Optional Query: ?category=PIZZA
 */
export const itemList = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 2. Extract parameters
  // 'id' comes from the route path /:id/items
  const restaurantId = req.params.id;
  // 'category' comes from the search query ?category=BIRYANI
  const categoryQuery = req.query.category as string | undefined;

  try {
    // 3. Build the dynamic filter object
    // This is the 'whereClause' you were trying to build
    const filter: any = {
      restaurantId: restaurantId,
      isDeleted: false, // Only show items that are active
    };

    // 4. Validate and add Category filter if provided
    if (categoryQuery) {
      // Check if the query matches our Prisma Enum to avoid DB errors
      const isValidCategory = Object.values(ItemCategory).includes(
        categoryQuery as ItemCategory
      );

      if (isValidCategory) {
        filter.category = categoryQuery as ItemCategory;
      } else {
        return res.status(400).json({
          message: `Invalid category. Allowed values: ${Object.values(
            ItemCategory
          ).join(", ")}`,
        });
      }
    }

    // 5. Execute the query
    const items = await prisma.menuItem.findMany({
      where: filter, // Use the object directly here
      orderBy: {
        name: "asc", // Sort alphabetically
      },
    });

    // 6. Return response
    return res.status(200).json({
      success: true,
      count: items.length,
      restaurantId,
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Toggle Restaurant Open/Close status
// @route   PATCH /api/restaurants/:id/toggle-status
export const toggleRestaurantStatus = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const restaurantId = req.params.restaurantId as string;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "You do not own this restaurant" });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isOpen: !restaurant.isOpen },
    });

    return res.status(200).json({
      message: updatedRestaurant.isOpen
        ? "Restaurant is now OPEN"
        : "Restaurant is now CLOSED",
      isOpen: updatedRestaurant.isOpen,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update restaurant status" });
  }
};

// @desc    Update a Menu Item (Price, Stock, Details)
// @route   PATCH /api/restaurants/item/:id
export const updateItem = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const itemId = req.params.id as string;
  const { price, isAvailable, name, description, imageUrl } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // 1. Verify the item belongs to a restaurant owned by the user
    const existingItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { restaurant: true },
    });

    if (!existingItem || existingItem.restaurant.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Item not found or you don't have permission" });
    }

    // 2. Update the item
    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(price !== undefined && { price }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return res.status(200).json({
      message: "Item updated successfully",
      updatedItem,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update item" });
  }
};
