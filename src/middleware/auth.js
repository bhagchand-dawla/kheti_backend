// ─── JWT Authentication Middleware ────────────────
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import prisma from "../config/database.js";

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Access token is required");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        const decoded = jwt.verify(token, env.jwt.secret);

        // Verify user still exists in the database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true },
        });

        if (!user) {
            throw ApiError.unauthorized("User associated with this token no longer exists");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        next(error);
    }
};

/**
 * Role-based access control middleware.
 * @param  {...string} roles - Allowed roles (e.g. "ADMIN", "SUPER_ADMIN")
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized("Authentication required"));
        }

        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden("You do not have permission to perform this action"));
        }

        next();
    };
};

export { authenticate, authorize };
