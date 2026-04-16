import { type Request, type Response } from "express";
export declare const addRestaurant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addCatagories: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCatagory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const itemList: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=restaurantController.d.ts.map