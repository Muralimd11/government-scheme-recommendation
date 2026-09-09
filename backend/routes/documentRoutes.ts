import { Router } from "express";
import { uploadDocument, getMyDocuments, deleteDocument } from "../controllers/documentController";
import { authenticateUser, authorizeFarmer } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/", authenticateUser, authorizeFarmer, upload.single("file"), uploadDocument);
router.get("/", authenticateUser, authorizeFarmer, getMyDocuments);
router.delete("/:id", authenticateUser, authorizeFarmer, deleteDocument);

export default router;
