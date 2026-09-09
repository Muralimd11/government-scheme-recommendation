import { Router } from "express";
import { register, login, getMe, forgotPassword } from "../controllers/authController";
import { validateRegister, validateLogin } from "../validators/authValidator";
import { authenticateUser } from "../middleware/auth";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.get("/me", authenticateUser, getMe);

export default router;
