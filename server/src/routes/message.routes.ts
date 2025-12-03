import { Router } from "express";
import { getMessages, deleteMessage } from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:conversationId", authenticate, getMessages);
router.delete("/:messageId", authenticate, deleteMessage);

export default router;