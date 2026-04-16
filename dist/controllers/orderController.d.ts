import { type Request, type Response } from "express";
export declare const placeOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const orderHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrderDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=orderController.d.ts.map