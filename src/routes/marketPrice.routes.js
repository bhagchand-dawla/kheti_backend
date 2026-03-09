// ─── Market Price Routes ──────────────────────────
import { Router } from "express";
import {
    getAllMarketPrices,
    getMarketPriceById,
    getMarketPricesByCommodity,
    getStates,
    getCommodities,
    getMarkets,
    createMarketPrice,
    bulkCreateMarketPrices,
    updateMarketPrice,
    deleteMarketPrice,
} from "../controllers/marketPrice.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
    validateCreateMarketPrice,
    validateUpdateMarketPrice,
    validateBulkCreateMarketPrice,
    validateIdParam,
} from "../middleware/validate.js";

const router = Router();

// ─── Public Routes ───────────────────────────────
router.get("/", getAllMarketPrices);
router.get("/filters/states", getStates);
router.get("/filters/commodities", getCommodities);
router.get("/filters/markets", getMarkets);
router.get("/commodity/:name", getMarketPricesByCommodity);
router.get("/:id", validateIdParam, getMarketPriceById);

// ─── Protected Routes (Admin only) ──────────────
router.post("/", authenticate, validateCreateMarketPrice, createMarketPrice);
router.post("/bulk", authenticate, validateBulkCreateMarketPrice, bulkCreateMarketPrices);
router.put("/:id", authenticate, validateIdParam, validateUpdateMarketPrice, updateMarketPrice);
router.delete("/:id", authenticate, validateIdParam, deleteMarketPrice);

export default router;
