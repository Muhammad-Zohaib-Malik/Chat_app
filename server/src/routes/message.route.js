import { Router } from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/message.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:receiverId", verifyAccessToken, getMessages);
router.post("/send/:receiverId", verifyAccessToken, sendMessage);
router.delete("/:messageId", verifyAccessToken, deleteMessage);

export default router;
