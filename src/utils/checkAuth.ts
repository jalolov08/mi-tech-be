import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

interface DecodedToken {
  userId: string;
  email: string;
  role:string;
}
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}
async function checkAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        msg: "Нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      msg: "Нет доступа",
    });
  }
}

export default checkAuth;
