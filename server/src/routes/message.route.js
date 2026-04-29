import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:receiverId", verifyAccessToken, getMessages);
router.post("/send/:receiverId", verifyAccessToken, sendMessage);


export default router;
