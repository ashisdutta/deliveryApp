import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { addressSchema, updateAddressSchema } from "../types/types.js";

import "dotenv/config";

// --- Add a New Address ---
export const addAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  const validation = addressSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid address data",
      errors: validation.error.format(),
    });
  }

  const data = validation.data;

  try {
    const newAddress = await prisma.address.create({
      data: {
        ...data,
        userId: userId, // Link the address to the logged-in user
      } as any,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({ message: "Failed to add address" });
  }
};

// --- Update an Existing Address ---
export const updateAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const addressId = req.params.id as string; // Expecting the ID in the URL: /api/users/address/:id

  const validation = updateAddressSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid address data",
      errors: validation.error.format(),
    });
  }

  try {
    // 1. Security Check: Ensure the address exists AND belongs to the user
    // If a malicious user tries to pass someone else's address ID, this stops them.
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!existingAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    // 2. Perform the update
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: validation.data as any,
    });

    return res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ message: "Failed to update address" });
  }
};

// --- Delete an Address ---
export const deleteAddress = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const addressId = req.params.id as string;

  try {
    // 1. Security Check: Ensure they own the address before deleting
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: userId },
    });

    if (!existingAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    // 2. Delete
    await prisma.address.delete({
      where: { id: addressId },
    });

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ message: "Failed to delete address" });
  }
};

// --- Update User ---
export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { name, phone } = req.body;

  try {
    const updated = await prisma.user.update({
      where: {
        id: userId as string,
      },
      data: {
        name,
        phone,
      },
      select: { id: true, name: true, phone: true },
    });

    if (updated) {
      return res.status(200).json({
        msg: "Update successful",
        user: updated,
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      message: "Failed to update user",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
export const getUserProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: { id: true, name: true, phone: true, role: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
};

// @desc    Get logged in user's addresses
// @route   GET /api/users/addresses
export const getMyAddresses = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" }, // Shows the newest addresses first
    });

    return res.status(200).json(addresses);
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({ message: "Failed to fetch addresses" });
  }
};
