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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(
    cors({
        origin: env.cors.origin,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.isDev) {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartKheti API is running",
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv,
    });
});

app.use("/api", routes);

app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");

        const server = app.listen(env.port, () => {
            console.log(`SmartKheti API server listening on port ${env.port}`);
            console.log(`Health check: ${env.baseUrl}/api/health`);
        });

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`Port ${env.port} is already in use. Update PORT in .env or stop the other process.`);
                process.exit(1);
            }

            console.error("Failed to start server:", error.message);
            process.exit(1);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

export default app;
