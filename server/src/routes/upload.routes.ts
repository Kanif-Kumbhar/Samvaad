import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/signature", authenticate, getUploadSignature);

export default router;