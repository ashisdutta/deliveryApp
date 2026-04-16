import {} from "express";
import jwt from "jsonwebtoken";
import {} from "../types/definitions.js";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
export const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        // Extract the token string (format is "Bearer <token>")
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token found" });
        return;
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach user info to request object
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: "Forbidden: You do not have permission to perform this action",
            });
            return;
        }
        next();
    };
};
//# sourceMappingURL=authMiddleware.js.map