import {Request, Response, NextFunction} from "express";


export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        req.token = token;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};
