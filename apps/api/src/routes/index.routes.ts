import {Router} from "express";
import { getAllMarkets, getCategories, getMarket, getMarketTrades, getMe, getOrderbook, logout, signin, signup } from "../controllers/index.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import userRouter from "./user.route";
import adminRouter from "./admin.routes";

const router:ReturnType<typeof Router> = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout",authenticateToken, logout)
router.get("/me",authenticateToken,getMe)
router.get("/categories", getCategories)
router.get("/markets", getAllMarkets)
router.get("/trades/:marketSymbol", authenticateToken, getMarketTrades)
router.get("/market/:marketSymbol", getMarket )
router.get("/orderbook/:symbol",authenticateToken, getOrderbook)

router.use("/user", userRouter)
router.use("/admin",adminRouter)
export default router;