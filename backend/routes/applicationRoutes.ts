import { Router } from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus
} from "../controllers/applicationController";
import { authenticateUser, authorizeFarmer, authorizeAdmin } from "../middleware/auth";

const router = Router();

router.post("/", authenticateUser, authorizeFarmer, createApplication);
router.get("/", authenticateUser, getMyApplications);
router.get("/:id", authenticateUser, getApplicationById);
router.put("/:id/status", authenticateUser, authorizeAdmin, updateApplicationStatus);

export default router;
