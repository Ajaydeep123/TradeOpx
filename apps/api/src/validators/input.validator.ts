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



