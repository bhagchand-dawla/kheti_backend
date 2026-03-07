// ─── Auth Controller ──────────────────────────────
import AuthService from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── POST /api/auth/register ─────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw ApiError.badRequest("Name, email, and password are required");
    }

    if (password.length < 6) {
        throw ApiError.badRequest("Password must be at least 6 characters");
    }

    const result = await AuthService.register({ name, email, password });

    return ApiResponse.created(res, result, "Admin registered successfully");
});

// ─── POST /api/auth/login ────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw ApiError.badRequest("Email and password are required");
    }

    const result = await AuthService.login({ email, password });

    return ApiResponse.success(res, result);
});

// ─── GET /api/auth/me ────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, req.user);
});
