import {Router} from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { createCategory, createMarket, mintController } from "../controllers/admin.controller";

const adminRouter:ReturnType<typeof Router> = Router();

adminRouter.post('/create/category', authenticateToken, createCategory)
adminRouter.post("/create/market",authenticateToken, createMarket)
adminRouter.post("/mint",authenticateToken, mintController)

export default adminRouter