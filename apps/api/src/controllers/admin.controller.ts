import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { CategorySchema, MarketSchema, MintSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";


export const createMarket = asyncHandler(async(req:Request, res: Response) =>{
    const createMarketData = MarketSchema.safeParse(req.body);
    if(!createMarketData.success){
        return res.status(400).json({message:"schema validation failed!", error:createMarketData.error?.issues})
    }

    const {symbol, endTime, description, sourceOfTruth,categoryTitle}= createMarketData.data
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'create_market',
            payload:{
                token:req.token!,
                symbol,
                endTime,
                description,
                sourceOfTruth,
                categoryTitle
            }
        })

        if(responseFromEngine.success){
            return res.status(200).json(responseFromEngine)
        }else{
            return res.status(400).json(responseFromEngine)
        }  
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal server errror", error})
    }
})

export const createCategory = asyncHandler(async(req:Request, res: Response) =>{
    const categoryData = CategorySchema.safeParse(req.body)
    if(!categoryData.success){
        return res.status(400).json({message:"schema validation failed!", error:categoryData.error?.issues})
    }

    const {title, icon, description} = categoryData.data;
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'create_category',
            payload:{
                token:req.token!,
                title,
                icon,
                description
            }
        })

        if(responseFromEngine.success){
            return res.status(200).json(responseFromEngine)
        }else{
            return res.status(400).json(responseFromEngine)
        }  
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal server errror", error})
    }    
})

export const mintController = asyncHandler(async(req:Request, res: Response) =>{
    const mintData = MintSchema.safeParse(req.body);
    if(!mintData.success){
        return res.status(400).json({message:"schema validation failed!", error:mintData.error?.issues})
    }

    const {symbol, quantity, price} = mintData.data;
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'mint',
            payload:{
                token:req.token!,
                symbol,
                quantity,
                price
            }
        })
        if(responseFromEngine.success){
            return res.status(200).json(responseFromEngine)
        }else{
            return res.status(400).json(responseFromEngine)
        }  
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal server errror", error})
    }    
})