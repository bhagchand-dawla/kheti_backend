// ─── Government Data Controller ───────────────────
// Handles fetching live data from data.gov.in and syncing to DB

import GovDataService from "../services/govData.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── GET /api/gov-data/live ──────────────────────
// Fetch live market prices from government API
export const getLivePrices = asyncHandler(async (req, res) => {
    const data = await GovDataService.fetchLive(req.query);

    return ApiResponse.success(res, data);
});

// ─── GET /api/gov-data/live/search/:commodity ────
// Search for a specific commodity's live prices
export const searchCommodityLive = asyncHandler(async (req, res) => {
    const data = await GovDataService.searchCommodity(
        req.params.commodity,
        req.query
    );

    return ApiResponse.success(res, data);
});

// ─── GET /api/gov-data/live/states ───────────────
// Get available states from live government data
export const getLiveStates = asyncHandler(async (req, res) => {
    const states = await GovDataService.fetchStates();

    return ApiResponse.success(res, states);
});

// ─── GET /api/gov-data/live/commodities ──────────
// Get available commodities from live government data
export const getLiveCommodities = asyncHandler(async (req, res) => {
    const commodities = await GovDataService.fetchCommodities(req.query);

    return ApiResponse.success(res, commodities);
});

// ─── GET /api/gov-data/live/markets ──────────────
// Get available markets from live government data
export const getLiveMarkets = asyncHandler(async (req, res) => {
    const markets = await GovDataService.fetchMarkets(req.query);

    return ApiResponse.success(res, markets);
});

// ─── POST /api/gov-data/sync ─────────────────────
// Fetch data from government API and save to our database
export const syncGovData = asyncHandler(async (req, res) => {
    const result = await GovDataService.syncToDatabase(req.query);

    return ApiResponse.success(res, result);
});
