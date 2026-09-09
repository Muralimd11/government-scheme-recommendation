import { Router } from "express";
import { getNotifications, createNotification, markAsRead } from "../controllers/notificationController";
import { authenticateUser, authorizeAdmin } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, getNotifications);
router.post("/", authenticateUser, authorizeAdmin, createNotification);
router.put("/:id/read", authenticateUser, markAsRead);

export default router;
