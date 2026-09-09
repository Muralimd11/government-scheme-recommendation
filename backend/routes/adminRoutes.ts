import { Router } from "express";
import {
  getDashboardStats,
  getFarmersList,
  updateFarmerStatus,
  createScheme,
  updateScheme,
  deleteScheme,
  getAllDocuments,
  verifyDocument,
  getReports,
  getAuditLogs
} from "../controllers/adminController";
import { authenticateUser, authorizeAdmin } from "../middleware/auth";

const router = Router();

// All admin routes require JWT + ADMIN role
router.use(authenticateUser, authorizeAdmin);

router.get("/analytics", getDashboardStats);
router.get("/farmers", getFarmersList);
router.put("/farmers/:id/status", updateFarmerStatus);

router.post("/schemes", createScheme);
router.put("/schemes/:id", updateScheme);
router.delete("/schemes/:id", deleteScheme);

router.get("/documents", getAllDocuments);
router.put("/documents/:id/verify", verifyDocument);

router.get("/reports", getReports);
router.get("/audit-logs", getAuditLogs);

export default router;
