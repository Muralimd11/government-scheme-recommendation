import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "tn_farmer_scheme_jwt_secret_key_2026";

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      res.status(401).json({ success: false, message: "User account not found." });
      return;
    }

    if (user.accountStatus === "DISABLED") {
      res.status(403).json({ success: false, message: "Account is disabled. Please contact the administrator." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
}

export function authorizeAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Access forbidden. Administrator privileges required."
    });
    return;
  }
  next();
}

export function authorizeFarmer(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "FARMER") {
    res.status(403).json({
      success: false,
      message: "Access forbidden. Farmer credentials required."
    });
    return;
  }
  next();
}
