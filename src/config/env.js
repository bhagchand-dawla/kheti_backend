// ─── Environment Configuration ────────────────────
import "dotenv/config";

const env = {
    port: parseInt(process.env.PORT, 10) || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",

    database: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        secret: process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },

    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    },

    baseUrl: process.env.BASE_URL || "http://localhost:4000",

    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    },

    govData: {
        apiKey: process.env.GOV_DATA_API_KEY || "",
        resourceId: process.env.GOV_DATA_RESOURCE_ID || "9ef84268-d588-465a-a308-a864a43d0070",
        baseUrl: "https://api.data.gov.in/resource",
    },
};

export default env;
