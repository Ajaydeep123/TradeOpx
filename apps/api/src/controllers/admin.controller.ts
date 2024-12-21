import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { CategorySchema, MarketSchema, MintSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";


export const createMarket = asyncHandler(async(req:Request, res: Response) =>{

})

export const createCategory = asyncHandler(async(req:Request, res: Response) =>{
    
})

export const mintController = asyncHandler(async(req:Request, res: Response) =>{
    
})