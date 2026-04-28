import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getProfile
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected route
router.get("/profile", verifyAccessToken, getProfile);

export default router;
