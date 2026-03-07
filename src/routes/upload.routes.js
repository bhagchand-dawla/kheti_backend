// ─── Upload Routes ────────────────────────────────
import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import upload from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ─── POST /api/upload ────────────────────────────
// Protected — only authenticated admins can upload
router.post("/", authenticate, upload.single("file"), uploadImage);

export default router;
