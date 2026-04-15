// Import the Role enum directly from your generated Prisma client
import { Role } from "../generated/prisma/index.js";

// Define the exact shape of the payload signed in authController.js
export interface JwtPayload {
  userId: string;
  role: Role;
}

// Extend the Express Request object
declare global {
    namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
