import {Router} from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { buyController, cancelBuy, cancelSell, onRampInr, ordersInParticularMarket, sellController } from "../controllers/user.controller";

const userRouter:ReturnType<typeof Router> = Router();

userRouter.post("/onramp/inr", authenticateToken, onRampInr)
userRouter.post("/buy", authenticateToken, buyController)
userRouter.post("/sell", authenticateToken, sellController)
userRouter.post("/cancel/buy", authenticateToken, cancelBuy)
userRouter.post("/cancel/sell",authenticateToken, cancelSell)
userRouter.get("/:marketSymbol/orders", authenticateToken, ordersInParticularMarket)

export default userRouter