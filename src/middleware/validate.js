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

// ─── Market Price Validators ─────────────────────

/**
 * Validates the request body for creating a market price.
 */
const validateCreateMarketPrice = (req, res, next) => {
    const errors = [];
    const body = req.body;

    if (!body.commodity || typeof body.commodity !== "string" || body.commodity.trim() === "") {
        errors.push({ field: "commodity", message: "Commodity name is required" });
    }

    if (!body.market || typeof body.market !== "string" || body.market.trim() === "") {
        errors.push({ field: "market", message: "Market/Mandi name is required" });
    }

    if (!body.state || typeof body.state !== "string" || body.state.trim() === "") {
        errors.push({ field: "state", message: "State is required" });
    }

    if (body.minPrice === undefined || isNaN(body.minPrice) || body.minPrice < 0) {
        errors.push({ field: "minPrice", message: "Minimum price must be a positive number" });
    }

    if (body.maxPrice === undefined || isNaN(body.maxPrice) || body.maxPrice < 0) {
        errors.push({ field: "maxPrice", message: "Maximum price must be a positive number" });
    }

    if (body.modalPrice === undefined || isNaN(body.modalPrice) || body.modalPrice < 0) {
        errors.push({ field: "modalPrice", message: "Modal price must be a positive number" });
    }

    if (!body.priceDate) {
        errors.push({ field: "priceDate", message: "Price date is required" });
    } else if (isNaN(new Date(body.priceDate).getTime())) {
        errors.push({ field: "priceDate", message: "Price date must be a valid date" });
    }

    // Cross-field validation
    if (body.minPrice !== undefined && body.maxPrice !== undefined && body.minPrice > body.maxPrice) {
        errors.push({ field: "minPrice", message: "Minimum price cannot be greater than maximum price" });
    }

    if (errors.length > 0) {
        throw ApiError.badRequest("Validation failed", errors);
    }

    next();
};

/**
 * Validates the request body for updating a market price.
 * Allows partial updates.
 */
const validateUpdateMarketPrice = (req, res, next) => {
    const errors = [];
    const body = req.body;

    if (body.commodity !== undefined && (typeof body.commodity !== "string" || body.commodity.trim() === "")) {
        errors.push({ field: "commodity", message: "Commodity name cannot be empty" });
    }

    if (body.market !== undefined && (typeof body.market !== "string" || body.market.trim() === "")) {
        errors.push({ field: "market", message: "Market name cannot be empty" });
    }

    if (body.state !== undefined && (typeof body.state !== "string" || body.state.trim() === "")) {
        errors.push({ field: "state", message: "State cannot be empty" });
    }

    const priceFields = ["minPrice", "maxPrice", "modalPrice"];
    priceFields.forEach((field) => {
        if (body[field] !== undefined && (isNaN(body[field]) || body[field] < 0)) {
            errors.push({ field, message: `${field} must be a positive number` });
        }
    });

    if (body.priceDate !== undefined && isNaN(new Date(body.priceDate).getTime())) {
        errors.push({ field: "priceDate", message: "Price date must be a valid date" });
    }

    if (errors.length > 0) {
        throw ApiError.badRequest("Validation failed", errors);
    }

    next();
};

/**
 * Validates bulk create request for market prices.
 */
const validateBulkCreateMarketPrice = (req, res, next) => {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
        throw ApiError.badRequest("'records' must be a non-empty array");
    }

    if (records.length > 500) {
        throw ApiError.badRequest("Maximum 500 records allowed per bulk request");
    }

    const errors = [];
    records.forEach((record, index) => {
        if (!record.commodity) errors.push({ field: `records[${index}].commodity`, message: "Commodity is required" });
        if (!record.market) errors.push({ field: `records[${index}].market`, message: "Market is required" });
        if (!record.state) errors.push({ field: `records[${index}].state`, message: "State is required" });
        if (record.minPrice === undefined) errors.push({ field: `records[${index}].minPrice`, message: "Min price is required" });
        if (record.maxPrice === undefined) errors.push({ field: `records[${index}].maxPrice`, message: "Max price is required" });
        if (record.modalPrice === undefined) errors.push({ field: `records[${index}].modalPrice`, message: "Modal price is required" });
        if (!record.priceDate) errors.push({ field: `records[${index}].priceDate`, message: "Price date is required" });
    });

    if (errors.length > 0) {
        throw ApiError.badRequest("Bulk validation failed", errors);
    }

    next();
};

export {
    validateCreateCrop,
    validateUpdateCrop,
    validateIdParam,
    validateCreateMarketPrice,
    validateUpdateMarketPrice,
    validateBulkCreateMarketPrice,
};
