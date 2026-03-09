// ─── Government Data Routes ──────────────────────
import { Router } from "express";
import {
    getLivePrices,
    searchCommodityLive,
    getLiveStates,
    getLiveCommodities,
    getLiveMarkets,
    syncGovData,
} from "../controllers/govData.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ─── Public Routes (Live data from data.gov.in) ──
router.get("/live", getLivePrices);
router.get("/live/states", getLiveStates);
router.get("/live/commodities", getLiveCommodities);
router.get("/live/markets", getLiveMarkets);
router.get("/live/search/:commodity", searchCommodityLive);

// ─── Protected Routes (Admin only) ──────────────
router.post("/sync", authenticate, syncGovData);

export default router;
