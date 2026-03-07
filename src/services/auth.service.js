// ─── Auth Service ─────────────────────────────────
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

class AuthService {
    // ─── Register Admin ────────────────────────────
    static async register({ name, email, password }) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw ApiError.conflict("User with this email already exists");
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = this.#generateToken(user.id);

        return { user, token };
    }

    // ─── Login ─────────────────────────────────────
    static async login({ email, password }) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Generate token
        const token = this.#generateToken(user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }

    // ─── Generate JWT ──────────────────────────────
    static #generateToken(userId) {
        return jwt.sign({ id: userId }, env.jwt.secret, {
            expiresIn: env.jwt.expiresIn,
        });
    }
}

export default AuthService;
