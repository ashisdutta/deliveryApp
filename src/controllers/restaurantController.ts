import {type Request, type Response} from "express";
import { prisma } from "../lib/prisma.js";
import { createRestaurantSchema, createCategorySchema, addItemSchema } from "../types/types.js";



export const addRestaurant = async (req:Request, res:Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'RESTAURANT_OWNER' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only owners can create restaurants" });
    }

    const result = createRestaurantSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            message: "Invalid inputs",
            errors: result.error.issues
        })
    }
    
    const { 
        name, description, street, city, state, zipCode, 
        latitude, longitude, deliverySlabs 
    } = result.data;

    const existingRestaurant = await prisma.restaurant.findFirst({
        where: { ownerId: userId }
    });
    if (existingRestaurant) {
        return res.status(400).json({ message: "You already have a restaurant" });
    }

    try {
        const newRestaurant = await prisma.restaurant.create({
            data: {
                name,
                description:description ?? null,
                ownerId:userId,
                address: {
                    create: {
                        street,
                        city,
                        state,
                        zipCode,
                        latitude,
                        longitude,
                    }
                },
                deliverySlabs: {
                    create: deliverySlabs // Maps minDistance, maxDistance, price automatically
                }
            },
            include: {
                address: true,
                deliverySlabs: true
            }
        });

        return res.status(201).json(
            {message: " successfully",
            newRestaurant});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Failed to create restaurant" });
    }
}


export const addCatagories = async (req:Request, res:Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'RESTAURANT_OWNER' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only owners can create restaurants" });
    }

    const result = createCategorySchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            message: "Invalid inputs",
            errors: result.error.issues
        })
    }
    const { 
        name, restaurantId
    } = result.data;
    
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                ownerId: userId, // Ensure the logged-in user is the owner
            },
        });

        if (!restaurant) {
            return res.status(403).json({ message: "You do not have permission to add categories to this restaurant" });
        }
        
        const newCatagory = await prisma.category.create({
            data: {
                name,
                restaurantId
            }
        });

        return res.status(201).json(
            {message: " successfully created catagory",
            newCatagory});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Failed to create catagory" });
    }
}



export const addItem = async (req:Request, res:Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'RESTAURANT_OWNER' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only owners can create restaurants" });
    }

    const result = addItemSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            message: "Invalid inputs",
            errors: result.error.issues
        })
    }
    const { 
            name, 
            description, 
            price, 
            imageUrl, 
            categoryId, 
            restaurantId, 
            isAvailable 
        } = result.data;
    
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                ownerId: userId,
            },
        });

        if (!restaurant) {
            return res.status(403).json({ message: "You do not own this restaurant" });
        }

        const newItem = await prisma.menuItem.create({
            data: {
                name, 
                description: description ?? null, 
                price, 
                imageUrl: imageUrl ?? null, 
                categoryId, 
                restaurantId, 
                isAvailable
            }
        });

        return res.status(201).json(
            {message: " successfully created Item",
            newItem});
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Failed to create Item" });
    }
}

export const deleteItem = async (req:Request, res:Response) => {
    const userId = req.user?.userId;
    const itemId = req.params.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'RESTAURANT_OWNER' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only owners can create restaurants" });
    }

    try {
        const deleteOperation = await prisma.menuItem.deleteMany({
            where: {
                id: itemId as string, 
                restaurant: {
                    ownerId: userId
                }
            }
        });
        return res.status(200).json(
            {message: " Item deleted successfully",
                deleteOperation
            }
        );
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete Item" });
    }
}

export const deleteCatagory = async (req:Request, res:Response) => {
    const userId = req.user?.userId;
    const catagoryId = req.params.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== 'RESTAURANT_OWNER' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only owners can create restaurants" });
    }

    try {
        const deleteOperation = await prisma.category.deleteMany({
            where: {
                id: catagoryId as string, 
                restaurant: {
                    ownerId: userId
                }
            }
        });
        return res.status(201).json(
            {message: " catagory deleted successfully",
                deleteOperation
            }
        );
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete catagory" });
    }
}



// for any Role
export const itemList = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const restaurantId = req.params.id;
    const categoryId = req.query.categoryId as string | undefined;

    try {
        const whereClause: any = { restaurantId };
        
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const items = await prisma.menuItem.findMany({
            where: whereClause,
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Error fetching items:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};