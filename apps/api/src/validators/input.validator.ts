import {z} from 'zod'

export const SignupSchema = z.object({
    username: z.string().min(3, "Username should be more then 3 characters").max(255),
    email:z.string().email("Invalid email address").min(6,"Email is required"),
    password:z.string().min(8,"Password must be atleast 8 digits").max(255),
    role: z.enum(["user","admin"])
})

export const SigninSchema = z.object({
    email:z.string().email("Invalid email address").min(6,"Email is required"),
    password:z.string().min(8,"Password must be atleast 8 digits").max(255)
})

export const OrderSchema = z.object({
    symbol: z.string().min(6, "Symbol should be more than 6 characters").max(255),
    quantity: z.number().gt(0, "Quantity must be greater than 0"),
    price: z.number().gt(0, "Price must be greater 0").lt(10, "Price should be less then 10"),
    stockType:z.enum(['YES','NO'])
})

export const CategorySchema = z.object({
    title : z.string().min(3, "Title must be greater then 3 characters"),
    icon: z.string().min(1, "Icon is required"),
    description: z.string().min(1,"Description is required!")
})

export const MarketSchema = z.object({
    symbol: z.string().min(6, "Symbol should be more than 6 characters").max(255),
    description: z.string().min(1,"Description is required!"),
    endTime: z.string()
        .datetime() 
        .transform((str) => new Date(str)),    
    sourceOfTruth: z.string().min(1, "Source of truth is required"),
    categoryTitle: z.string().min(1, "Category title is required")
})

export const MintSchema = z.object({
    symbol: z.string().min(6, "Symbol should be more than 6 characters").max(255),
    quantity: z.number().gt(0, "Quantity must be greater than 0"),
    price: z.number().gt(0, "Price must be greater 0").lt(10, "Price should be less then 10"),  
})


