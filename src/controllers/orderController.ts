import { Prisma } from "../generated/prisma/client.js";
import {type Request, type Response} from "express";

export const placeOrder = async (req: Request, res: Response) =>{
    const { restaurantId, items, addressId } = req.body; 
    const userId = req.user.id;
}