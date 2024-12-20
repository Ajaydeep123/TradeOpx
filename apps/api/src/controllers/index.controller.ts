import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { SignupSchema, SigninSchema } from "../validators/input.validator";
import { AsyncManager } from "../asyncmanager";

export const signup = asyncHandler( async(req:Request, res:Response) => {
    const signupData = SignupSchema.safeParse(req.body);

    if(!signupData.success){
        res.status(400).json({message:"schema validation failed!", error:signupData.error?.issues})
        return
    }

    const {username, password, email, role} = signupData.data;

    const responseFromEngine = await AsyncManager.getInstance().sendAndAwait({
        type:"signup",
        payload:{
            username,
            password,
            email,
            role
        }
    })

    res.json(responseFromEngine)

})

export const signin = asyncHandler(async ( req:Request, res:Response)=>{
    const signinData = SigninSchema.safeParse(req.body);

    if(!signinData.success){
        res.status(400).json({message:"Invalid data", error:signinData.error?.issues})
    }

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
    }

    res.status(200).json(responseFromEngine)
})

export const logout = asyncHandler(async(req: Request, res:Response)=>{
    try {
        res.clearCookie('authToken',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production'
        })
        
        res.status(200).json({success:true, message:"Logged out successfully",})

    } catch (error) {
        res.json({success:false, message:"Failed to logout"})
    }
})
