// ─── Crop Routes ──────────────────────────────────
import { Router } from "express";
import {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
} from "../controllers/crop.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateCreateCrop, validateUpdateCrop, validateIdParam } from "../middleware/validate.js";

const router = Router();

// ─── Public Routes ───────────────────────────────
router.get("/", getAllCrops);
router.get("/:id", validateIdParam, getCropById);

// ─── Protected Routes ───────────────────────────
router.post("/", authenticate, validateCreateCrop, createCrop);
router.put("/:id", authenticate, validateIdParam, validateUpdateCrop, updateCrop);
router.delete("/:id", authenticate, validateIdParam, deleteCrop);

export default router;
