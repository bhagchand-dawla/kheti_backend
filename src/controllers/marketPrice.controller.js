// ─── Market Price Controller ──────────────────────
// Thin controller layer — delegates to MarketPriceService

import MarketPriceService from "../services/marketPrice.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── GET /api/market-prices ──────────────────────
export const getAllMarketPrices = asyncHandler(async (req, res) => {
    const result = await MarketPriceService.getAll(req.query);

    return ApiResponse.paginated(res, result.data, result.pagination);
});

// ─── GET /api/market-prices/:id ──────────────────
export const getMarketPriceById = asyncHandler(async (req, res) => {
    const price = await MarketPriceService.getById(req.params.id);

    return ApiResponse.success(res, price);
});

// ─── GET /api/market-prices/commodity/:name ──────
export const getMarketPricesByCommodity = asyncHandler(async (req, res) => {
    const result = await MarketPriceService.getByCommodity(
        req.params.name,
        req.query
    );

    return ApiResponse.paginated(res, result.data, result.pagination);
});

// ─── GET /api/market-prices/filters/states ───────
export const getStates = asyncHandler(async (req, res) => {
    const states = await MarketPriceService.getStates();

    return ApiResponse.success(res, states);
});

// ─── GET /api/market-prices/filters/commodities ──
export const getCommodities = asyncHandler(async (req, res) => {
    const commodities = await MarketPriceService.getCommodities();

    return ApiResponse.success(res, commodities);
});

// ─── GET /api/market-prices/filters/markets ──────
export const getMarkets = asyncHandler(async (req, res) => {
    const markets = await MarketPriceService.getMarkets(req.query);

    return ApiResponse.success(res, markets);
});

// ─── POST /api/market-prices ─────────────────────
export const createMarketPrice = asyncHandler(async (req, res) => {
    const price = await MarketPriceService.create(req.body);

    return ApiResponse.created(res, price, "Market price created successfully");
});

// ─── POST /api/market-prices/bulk ────────────────
export const bulkCreateMarketPrices = asyncHandler(async (req, res) => {
    const result = await MarketPriceService.bulkCreate(req.body.records);

    return ApiResponse.created(
        res,
        result,
        `${result.count} market price records created successfully`
    );
});

// ─── PUT /api/market-prices/:id ──────────────────
export const updateMarketPrice = asyncHandler(async (req, res) => {
    const price = await MarketPriceService.update(req.params.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Market price updated successfully",
        data: price,
    });
});

// ─── DELETE /api/market-prices/:id ───────────────
export const deleteMarketPrice = asyncHandler(async (req, res) => {
    await MarketPriceService.delete(req.params.id);

    return ApiResponse.message(res, "Market price deleted successfully");
});
