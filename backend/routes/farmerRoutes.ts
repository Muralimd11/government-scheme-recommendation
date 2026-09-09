import { Router } from "express";
import { getProfile, updateProfile, getFarmerDashboardSummary } from "../controllers/farmerController";
import { authenticateUser, authorizeFarmer } from "../middleware/auth";

const router = Router();

router.get("/profile", authenticateUser, authorizeFarmer, getProfile);
router.put("/profile", authenticateUser, authorizeFarmer, updateProfile);
router.get("/dashboard-summary", authenticateUser, authorizeFarmer, getFarmerDashboardSummary);

export default router;
