import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { OrderSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";


export const onRampInr = asyncHandler(async(req:Request, res: Response) =>{
    const {amount} = req.body

    if(!amount || amount<0){
        return res.json(400).json({success: false, message: "Please send amount greater then 0 to onramp"})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'onramp_inr',
            payload:{
                token:req.token!,
                amount
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

export const buyController = asyncHandler(async(req:Request, res: Response) =>{
    const buyData = OrderSchema.safeParse(req.body);
    if(!buyData.success){
        return res.status(400).json({message:"schema validation failed!", error:buyData.error?.issues})
    }

    const {symbol, quantity, price, stockType} = buyData.data;
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'buy',
            payload:{
                token:req.token!,
                symbol,
                quantity,
                price,
                stockType
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

export const sellController = asyncHandler(async(req:Request, res: Response) =>{
    const sellData = OrderSchema.safeParse(req.body);
    if(!sellData.success){
        return res.status(400).json({message:"schema validation failed!", error:sellData.error?.issues})
    }

    const {symbol, quantity, price, stockType} = sellData.data;
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'sell',
            payload:{
                token:req.token!,
                symbol,
                quantity,
                price,
                stockType
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

export const cancelBuy = asyncHandler(async(req:Request, res: Response) =>{
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string

    if(!orderId || !marketSymbol || (marketSymbol || orderId).length === 0){
        return res.status(401).json({success: false, message: "Invalid request, provide valid orderId and marketSymbol as query."})
    }

    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'cancel_buy_order',
            payload:{
                token:req.token!,
                orderId,
                marketSymbol
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


export const cancelSell = asyncHandler(async(req:Request, res: Response) =>{
    const orderId = req.query.orderId as string;
    const marketSymbol = req.query.marketSymbol as string

    if(!orderId || !marketSymbol || (marketSymbol || orderId).length === 0){
        return res.status(401).json({success: false, message: "Invalid request, provide valid orderId and marketSymbol as query."})
    }

    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'cancel_sell_order',
            payload:{
                token:req.token!,
                orderId,
                marketSymbol
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

export const ordersInParticularMarket = asyncHandler(async(req:Request, res: Response) =>{
    const marketSymbol = req.params.marketSymbol 
    if(marketSymbol?.length === 0 || !marketSymbol){
        return res.status(401).json({success:false, message:"Invalid params"})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_user_market_orders',
            payload:{
                token:req.token!,
                marketSymbol
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