import { Role } from "../generated/prisma/index.js";
export interface JwtPayload {
    userId: string;
    role: Role;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
//# sourceMappingURL=definitions.d.ts.map