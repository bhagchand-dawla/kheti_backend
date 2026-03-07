// ─── Validation Middleware ────────────────────────
import ApiError from "../utils/ApiError.js";

/**
 * Validates the request body for creating a crop.
 * Ensures required fields in basicInfo exist.
 */
const validateCreateCrop = (req, res, next) => {
    const errors = [];
    const { basicInfo } = req.body;

    if (!basicInfo) {
        errors.push({ field: "basicInfo", message: "Basic info section is required" });
        throw ApiError.badRequest("Validation failed", errors);
    }

    if (!basicInfo.name || typeof basicInfo.name !== "string" || basicInfo.name.trim() === "") {
        errors.push({ field: "basicInfo.name", message: "Crop name is required" });
    }

    if (!basicInfo.category || typeof basicInfo.category !== "string" || basicInfo.category.trim() === "") {
        errors.push({ field: "basicInfo.category", message: "Crop category is required" });
    }

    // ─── Optional Section Validations ──────────────

    const { soilRequirements } = req.body;
    if (soilRequirements) {
        if (soilRequirements.phMin !== undefined && (isNaN(soilRequirements.phMin) || soilRequirements.phMin < 0 || soilRequirements.phMin > 14)) {
            errors.push({ field: "soilRequirements.phMin", message: "pH minimum must be between 0 and 14" });
        }
        if (soilRequirements.phMax !== undefined && (isNaN(soilRequirements.phMax) || soilRequirements.phMax < 0 || soilRequirements.phMax > 14)) {
            errors.push({ field: "soilRequirements.phMax", message: "pH maximum must be between 0 and 14" });
        }
        if (
            soilRequirements.phMin !== undefined &&
            soilRequirements.phMax !== undefined &&
            soilRequirements.phMin > soilRequirements.phMax
        ) {
            errors.push({ field: "soilRequirements.phMin", message: "pH minimum cannot be greater than pH maximum" });
        }
    }

    const { marketInsights } = req.body;
    if (marketInsights) {
        if (marketInsights.avgPrice !== undefined && (isNaN(marketInsights.avgPrice) || marketInsights.avgPrice < 0)) {
            errors.push({ field: "marketInsights.avgPrice", message: "Average price must be a positive number" });
        }
    }

    const { businessAnalysis } = req.body;
    if (businessAnalysis) {
        const numericFields = ["seedCost", "fertilizerCost", "laborCost", "irrigationCost", "expectedYield"];
        numericFields.forEach((field) => {
            if (businessAnalysis[field] !== undefined && (isNaN(businessAnalysis[field]) || businessAnalysis[field] < 0)) {
                errors.push({ field: `businessAnalysis.${field}`, message: `${field} must be a positive number` });
            }
        });
    }

    // ─── Season Enum Validation ────────────────────
    if (basicInfo.season) {
        const validSeasons = ["KHARIF", "RABI", "ZAID", "ANNUAL"];
        if (!validSeasons.includes(basicInfo.season.toUpperCase())) {
            errors.push({
                field: "basicInfo.season",
                message: `Season must be one of: ${validSeasons.join(", ")}`,
            });
        }
    }

    if (errors.length > 0) {
        throw ApiError.badRequest("Validation failed", errors);
    }

    next();
};

/**
 * Validates the request body for updating a crop.
 * Allows partial updates — just validates what is provided.
 */
const validateUpdateCrop = (req, res, next) => {
    const errors = [];
    const body = req.body;

    // If basicInfo is provided, validate its fields
    if (body.basicInfo) {
        if (body.basicInfo.name !== undefined && (typeof body.basicInfo.name !== "string" || body.basicInfo.name.trim() === "")) {
            errors.push({ field: "basicInfo.name", message: "Crop name cannot be empty" });
        }
        if (body.basicInfo.category !== undefined && (typeof body.basicInfo.category !== "string" || body.basicInfo.category.trim() === "")) {
            errors.push({ field: "basicInfo.category", message: "Crop category cannot be empty" });
        }
    }

    // ─── Season Enum Validation ────────────────────
    if (body.basicInfo?.season) {
        const validSeasons = ["KHARIF", "RABI", "ZAID", "ANNUAL"];
        if (!validSeasons.includes(body.basicInfo.season.toUpperCase())) {
            errors.push({
                field: "basicInfo.season",
                message: `Season must be one of: ${validSeasons.join(", ")}`,
            });
        }
    }

    if (errors.length > 0) {
        throw ApiError.badRequest("Validation failed", errors);
    }

    next();
};

/**
 * Validates UUID params.
 */
const validateIdParam = (req, res, next) => {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
        throw ApiError.badRequest("Invalid ID format. Expected a valid UUID.");
    }

    next();
};

export { validateCreateCrop, validateUpdateCrop, validateIdParam };
