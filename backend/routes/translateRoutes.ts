import { Router } from "express";
import { translateTextHandler, getTranslationStatusHandler } from "../controllers/translateController";

const router = Router();

router.post("/", translateTextHandler);
router.get("/status", getTranslationStatusHandler);

export default router;
