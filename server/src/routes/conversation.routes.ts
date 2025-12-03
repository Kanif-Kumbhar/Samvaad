import { Router } from "express";
import {
	getConversations,
	createConversation,
} from "../controllers/conversation.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getConversations);
router.post("/", authenticate, createConversation);

export default router;