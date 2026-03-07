// ─── Route Index ──────────────────────────────────
// Centralizes all route imports for clean server.js

import { Router } from "express";
import cropRoutes from "./crop.routes.js";
import uploadRoutes from "./upload.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/crops", cropRoutes);
router.use("/upload", uploadRoutes);
router.use("/auth", authRoutes);

export default router;
