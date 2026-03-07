// ─── SmartKheti Backend Server ────────────────────
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import env from "./config/env.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import prisma from "./config/database.js";

// ─── __dirname for ES Modules ────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Initialize Express ──────────────────────────
const app = express();

// ─── Security Middleware ─────────────────────────
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// ─── CORS ────────────────────────────────────────
app.use(
    cors({
        origin: env.cors.origin,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ─── Body Parsing ────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Request Logging ─────────────────────────────
if (env.isDev) {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ─── Static Files (Uploads) ─────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ────────────────────────────────
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartKheti API is running 🌾",
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
    });
});

// ─── API Routes ──────────────────────────────────
app.use("/api", routes);

// ─── 404 Handler ─────────────────────────────────
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        app.listen(env.port, () => {
            console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🌾  SmartKheti API Server                  ║
║                                              ║
║   Port:        ${String(env.port).padEnd(28)}║
║   Environment: ${env.nodeEnv.padEnd(28)}║
║   Health:      ${(env.baseUrl + "/api/health").padEnd(28)}║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

export default app;
