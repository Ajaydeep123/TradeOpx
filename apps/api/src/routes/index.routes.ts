import {Router} from "express";
import { logout, signin, signup } from "../controllers/index.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router:ReturnType<typeof Router> = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout",authenticateToken, logout)

export default router;