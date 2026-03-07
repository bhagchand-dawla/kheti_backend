// ─── Upload Controller ────────────────────────────
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import env from "../config/env.js";

// ─── POST /api/upload ────────────────────────────
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw ApiError.badRequest("No file uploaded. Please attach an image file.");
    }

    const imageUrl = `${env.baseUrl}/uploads/${req.file.filename}`;

    return ApiResponse.success(res, { url: imageUrl });
});
