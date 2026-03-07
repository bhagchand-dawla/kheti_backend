// ─── Global Error Handler Middleware ──────────────
import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

const errorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    // ─── Prisma Errors ─────────────────────────────
    if (err.code === "P2002") {
        statusCode = 409;
        message = `Duplicate value for field: ${err.meta?.target?.join(", ")}`;
    }

    if (err.code === "P2025") {
        statusCode = 404;
        message = "Record not found";
    }

    if (err.code === "P2003") {
        statusCode = 400;
        message = "Foreign key constraint violation";
    }

    // ─── Multer Errors ─────────────────────────────
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        message = "File size exceeds the maximum allowed limit";
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        statusCode = 400;
        message = "Unexpected file field";
    }

    // ─── JWT Errors ────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // ─── Log in Development ────────────────────────
    if (env.isDev) {
        console.error("❌ Error:", {
            statusCode,
            message,
            stack: err.stack,
            ...(errors.length > 0 && { errors }),
        });
    }

    // ─── Send Response ─────────────────────────────
    const response = {
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(env.isDev && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

export default errorHandler;
