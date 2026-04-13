import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "../types/definitions.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// --- 1. Verify Login Status ---
export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Attach user info (userId, role) to request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// --- 2. Verify Role Permissions (Multi-Tenant Access) ---
// Note: This MUST be used after the 'protect' middleware in your routes
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If there is no user on the request, or their role isn't in the allowed list
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Forbidden: You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};
