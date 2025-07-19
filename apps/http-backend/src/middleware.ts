import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Verify credentials in database

    const token = req.headers["authorization"] ?? ""
    if (!token) return res.sendStatus(401);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "")
        //@ts-ignore
        req.userId = decoded.userId
        next()
    }
    catch (e) {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}
