import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { OrderSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";


export const onRampInr = asyncHandler(async(req:Request, res: Response) =>{

})

export const buyController = asyncHandler(async(req:Request, res: Response) =>{
    
})

export const sellController = asyncHandler(async(req:Request, res: Response) =>{
    
})

export const cancelBuy = asyncHandler(async(req:Request, res: Response) =>{
    
})


export const cancelSell = asyncHandler(async(req:Request, res: Response) =>{
    
})

export const ordersInParticularMarket = asyncHandler(async(req:Request, res: Response) =>{
    
})