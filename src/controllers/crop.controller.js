// ─── Crop Controller ──────────────────────────────
// Thin controller layer — delegates to CropService

import CropService from "../services/crop.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── GET /api/crops ──────────────────────────────
export const getAllCrops = asyncHandler(async (req, res) => {
    const result = await CropService.getAll(req.query);

    return ApiResponse.paginated(res, result.data, result.pagination);
});

// ─── GET /api/crops/:id ──────────────────────────
export const getCropById = asyncHandler(async (req, res) => {
    const crop = await CropService.getById(req.params.id);

    return ApiResponse.success(res, crop);
});

// ─── POST /api/crops ─────────────────────────────
export const createCrop = asyncHandler(async (req, res) => {
    const crop = await CropService.create(req.body);

    return ApiResponse.created(res, crop, "Crop created successfully");
});

// ─── PUT /api/crops/:id ──────────────────────────
export const updateCrop = asyncHandler(async (req, res) => {
    const crop = await CropService.update(req.params.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Crop updated successfully",
        data: crop,
    });
});

// ─── DELETE /api/crops/:id ───────────────────────
export const deleteCrop = asyncHandler(async (req, res) => {
    await CropService.delete(req.params.id);

    return ApiResponse.message(res, "Crop deleted successfully");
});
