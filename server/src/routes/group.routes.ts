import { Router } from "express";
import {
	createGroup,
	createGroupValidation,
	updateGroup,
	addGroupMember,
	removeGroupMember,
	makeAdmin,
	leaveGroup,
} from "../controllers/group.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, createGroupValidation, createGroup);
router.patch("/:conversationId", authenticate, updateGroup);
router.post("/:conversationId/members", authenticate, addGroupMember);
router.delete(
	"/:conversationId/members/:memberId",
	authenticate,
	removeGroupMember
);
router.patch(
	"/:conversationId/members/:memberId/admin",
	authenticate,
	makeAdmin
);
router.post("/:conversationId/leave", authenticate, leaveGroup);

export default router;