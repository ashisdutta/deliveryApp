import { type Request, type Response } from "express";
import { orderSchema } from "../types/types.js";
import { prisma } from "../lib/prisma.js";
import { priceCalculator } from "../lib/priceCalculator.js";
import { OrderStatus } from "@prisma/client";

export const placeOrder = async (req: Request, res: Response) => {
  const result = orderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid inputs",
      errors: result.error.issues,
    });
  }
  const { restaurantId, items, addressId } = result.data;
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const {
      subTotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      totalAmount,
      orderItems,
    } = await priceCalculator(restaurantId, items, addressId);

    const newOrder = await prisma.order.create({
      data: {
        userId,
        restaurantId,
        subTotal,
        discountAmount,
        taxAmount,
        deliveryFee,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const orderHistory = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: { items: true },
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: "your order history is empty" });
    }
    return res.status(200).json({
      orders: orders,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const orderId = req.params.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (typeof orderId !== "string") {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const orderDetails = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: { items: true },
    });

    if (!orderDetails) {
      return res.status(411).json({
        message: "order doesn't exits",
      });
    }
    return res.status(200).json({
      orderDetails,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const orderId = req.params.id;
  if (typeof orderId !== "string") {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const orderInDB = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!orderInDB) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderInDB.status === OrderStatus.CANCELLED) {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if (
      orderInDB.status === OrderStatus.PREPARING ||
      orderInDB.status === OrderStatus.OUT_FOR_DELIVERY ||
      orderInDB.status === OrderStatus.DELIVERED
    ) {
      return res.status(403).json({
        message: `Cannot cancel, order is already ${orderInDB.status
          .toLowerCase()
          .replace(/_/g, " ")}`,
      });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
