import { Router } from "express";
import { searchUsers } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/search", authenticate, searchUsers);

export default router;