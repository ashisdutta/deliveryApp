import { type Request, type Response, type NextFunction } from "express";
export declare const protect: (req: Request, res: Response, next: NextFunction) => void;
export declare const restrictTo: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map