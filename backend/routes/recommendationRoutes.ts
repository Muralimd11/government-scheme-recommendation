import { Router, Request, Response, NextFunction } from "express";
import { getRecommendations } from "../controllers/recommendationController";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "tn_farmer_scheme_jwt_secret_key_2026";

// Optional authentication middleware: if token present, attach user; if not, proceed as guest
async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select("-passwordHash");
      if (user) {
        req.user = user;
      }
    }
  } catch (e) {
    // Ignore invalid token for public calculation
  }
  next();
}

router.post("/", optionalAuth, getRecommendations);

export default router;
