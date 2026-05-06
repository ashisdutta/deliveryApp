import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

// ─── Request Types ────────────────────────────────────────────────────────────

type SlabParams = { id: string };
type DistanceQuery = { distance?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if a [min, max] range overlaps with any existing slab.
 * Optionally exclude a slab by ID (used during updates).
 * Two ranges [a,b] and [c,d] overlap when: a < d && c < b
 */
const hasOverlap = async (
  minDistance: number,
  maxDistance: number,
  excludeId?: string
): Promise<boolean> => {
  const overlapping = await prisma.deliverySlab.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      minDistance: { lt: maxDistance },
      maxDistance: { gt: minDistance },
    },
  });
  return overlapping !== null;
};

// ─── GET /delivery-slabs ──────────────────────────────────────────────────────

/**
 * @desc    Get all delivery slabs, or find one by distance
 * @route   GET /api/delivery-slabs
 * @route   GET /api/delivery-slabs?distance=5
 * @access  Protected
 */
export const getDeliverySlabs = async (
  req: Request<{}, {}, {}, DistanceQuery>,
  res: Response
) => {
  try {
    const { distance } = req.query;

    // Distance query: return the single slab covering the given km value
    if (distance !== undefined) {
      const km = parseFloat(distance ?? "");

      if (isNaN(km) || km < 0) {
        return res.status(400).json({
          success: false,
          message: "distance must be a non-negative number.",
        });
      }

      const slab = await prisma.deliverySlab.findFirst({
        where: {
          minDistance: { lte: km },
          maxDistance: { gt: km },
        },
      });

      if (!slab) {
        return res.status(404).json({
          success: false,
          message: `No delivery slab found for distance ${km} km.`,
        });
      }

      return res.status(200).json({ success: true, slab });
    }

    // Default: return all slabs ordered by range
    const slabs = await prisma.deliverySlab.findMany({
      orderBy: { minDistance: "asc" },
    });

    return res.status(200).json({ success: true, count: slabs.length, slabs });
  } catch (error) {
    console.error("Fetch Delivery Slabs Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /delivery-slabs ─────────────────────────────────────────────────────

/**
 * @desc    Create a new delivery slab
 * @route   POST /api/delivery-slabs
 * @access  Super Admin only
 */
export const addDeliverySlab = async (req: Request, res: Response) => {
  const { minDistance, maxDistance, price } = req.body;

  // ── Presence check ──
  if (minDistance === undefined || maxDistance === undefined || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "minDistance, maxDistance, and price are required.",
    });
  }

  const min = parseFloat(minDistance);
  const max = parseFloat(maxDistance);
  const p = parseFloat(price);

  // ── Type check ──
  if (isNaN(min) || isNaN(max) || isNaN(p)) {
    return res.status(400).json({
      success: false,
      message: "minDistance, maxDistance, and price must be valid numbers.",
    });
  }

  // ── Range logic check ──
  if (min < 0) {
    return res.status(400).json({ success: false, message: "minDistance cannot be negative." });
  }
  if (max <= min) {
    return res.status(400).json({
      success: false,
      message: "maxDistance must be greater than minDistance.",
    });
  }
  if (p < 0) {
    return res.status(400).json({ success: false, message: "price cannot be negative." });
  }

  try {
    // ── Overlap check ──
    const overlap = await hasOverlap(min, max);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `The range [${min}, ${max}] km overlaps with an existing delivery slab.`,
      });
    }

    const slab = await prisma.deliverySlab.create({
      data: { minDistance: min, maxDistance: max, price: p },
    });

    return res.status(201).json({
      success: true,
      message: "Delivery slab created successfully.",
      slab,
    });
  } catch (error) {
    console.error("Add Delivery Slab Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── PUT /delivery-slabs/:id ──────────────────────────────────────────────────

/**
 * @desc    Update an existing delivery slab
 * @route   PUT /api/delivery-slabs/:id
 * @access  Super Admin only
 */
export const updateDeliverySlab = async (
  req: Request<SlabParams>,
  res: Response
) => {
  const { id } = req.params;
  const { minDistance, maxDistance, price } = req.body;

  // ── No body check ──
  if (minDistance === undefined && maxDistance === undefined && price === undefined) {
    return res.status(400).json({ success: false, message: "No update data provided." });
  }

  try {
    // ── Existence check ──
    const existing = await prisma.deliverySlab.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Delivery slab with id "${id}" not found.`,
      });
    }

    // Merge incoming values with existing ones for validation
    const min = minDistance !== undefined ? parseFloat(minDistance) : existing.minDistance;
    const max = maxDistance !== undefined ? parseFloat(maxDistance) : existing.maxDistance;
    const p = price !== undefined ? parseFloat(price) : existing.price;

    // ── Type check ──
    if (isNaN(min) || isNaN(max) || isNaN(p)) {
      return res.status(400).json({
        success: false,
        message: "minDistance, maxDistance, and price must be valid numbers.",
      });
    }

    // ── Range logic check ──
    if (min < 0) {
      return res.status(400).json({ success: false, message: "minDistance cannot be negative." });
    }
    if (max <= min) {
      return res.status(400).json({
        success: false,
        message: "maxDistance must be greater than minDistance.",
      });
    }
    if (p < 0) {
      return res.status(400).json({ success: false, message: "price cannot be negative." });
    }

    // ── Overlap check (exclude self) ──
    const overlap = await hasOverlap(min, max, id);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `The range [${min}, ${max}] km overlaps with another existing delivery slab.`,
      });
    }

    // Dynamically build update object — only include changed fields
    const updateData: { minDistance?: number; maxDistance?: number; price?: number } = {};
    if (minDistance !== undefined) updateData.minDistance = min;
    if (maxDistance !== undefined) updateData.maxDistance = max;
    if (price !== undefined) updateData.price = p;

    const updatedSlab = await prisma.deliverySlab.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery slab updated successfully.",
      slab: updatedSlab,
    });
  } catch (error) {
    console.error("Update Delivery Slab Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE /delivery-slabs/:id ───────────────────────────────────────────────

/**
 * @desc    Delete a delivery slab
 * @route   DELETE /api/delivery-slabs/:id
 * @access  Super Admin only
 */
export const deleteDeliverySlab = async (
  req: Request<SlabParams>,
  res: Response
) => {
  const { id } = req.params;

  try {
    // ── Existence check ──
    const existing = await prisma.deliverySlab.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Delivery slab with id "${id}" not found.`,
      });
    }

    await prisma.deliverySlab.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Delivery slab deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Delivery Slab Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};