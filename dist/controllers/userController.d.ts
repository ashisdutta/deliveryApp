import { type Request, type Response } from "express";
import "dotenv/config";
export declare const getMyAddresses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMe: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map