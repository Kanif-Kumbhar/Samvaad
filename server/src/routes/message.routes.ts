import { Router } from "express";
import { getMessages } from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:conversationId", authenticate, getMessages);

export default router;