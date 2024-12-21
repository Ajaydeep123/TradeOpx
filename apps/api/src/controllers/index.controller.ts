import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { SignupSchema, SigninSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";

export const signup = asyncHandler( async(req:Request, res:Response) => {
    const signupData = SignupSchema.safeParse(req.body);

    if(!signupData.success){
        return res.status(400).json({message:"schema validation failed!", error:signupData.error?.issues})
    }

    const {username, password, email, role} = signupData.data;

    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:"signup",
            payload:{
                username,
                password,
                email,
                role
            }
        })

        if(responseFromEngine.success){
            return res.status(201).json(responseFromEngine)
        }else{
            return res.status(401).json(responseFromEngine)
        }
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal server error", error})
    }

})

export const signin = asyncHandler(async ( req:Request, res:Response)=>{
    const signinData = SigninSchema.safeParse(req.body);

    if(!signinData.success){
       return res.status(400).json({message:"Invalid data", error:signinData.error?.issues})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:"signin",
            payload:{
                email: signinData.data?.email!,
                password: signinData.data?.password!
            }
        })
    
        if(responseFromEngine.data.success){
            res.cookie('authToken',responseFromEngine.data.token, {
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                maxAge:7*24*60*60*1000
            })
            return res.status(200).json(responseFromEngine)
        }else{
            return res.status(400).json(responseFromEngine)
        }
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal server error", error})
    }
})

export const logout = asyncHandler(async(req: Request, res:Response)=>{
    try {
        res.clearCookie('authToken',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production'
        })
        
        res.status(200).json({success:true, message:"Logged out successfully",})

    } catch (error) {
        res.status(500).json({success:false, message:"Failed to logout", error})
    }
})

export const getMe = asyncHandler(async(req:Request, res:Response)=>{
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_me',
            payload:{
                token:req.token!
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

export const getAllMarkets = asyncHandler(async(req:Request, res:Response)=>{
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_all_markets'
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

export const getCategories = asyncHandler(async(req:Request, res:Response)=>{
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_all_categories'
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

export const getMarketTrades = asyncHandler(async(req:Request, res:Response)=>{
    const marketSymbol = req.params.marketSymbol;

    if(marketSymbol?.length === 0 || !marketSymbol){
        return res.status(401).json({success:false, message:"Invalid params"})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_market_trades',
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

export const getMarket = asyncHandler(async(req:Request, res:Response)=>{
    const marketSymbol = req.params.marketSymbol;

    if(marketSymbol?.length === 0 || !marketSymbol){
        return res.status(401).json({success:false, message:"Invalid params"})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_market',
            payload:{
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

export const getOrderbook = asyncHandler(async(req:Request, res:Response)=>{
    const symbol = req.params.symbol;
    if(symbol?.length === 0 || !symbol){
        return res.status(400).json({success:false, message:"Invalid params"})
    }
    try {
        const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
            type:'get_orderbook',
            payload:{
                token:req.token!,
                symbol
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

