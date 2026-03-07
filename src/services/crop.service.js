// ─── Crop Service ─────────────────────────────────
// All business logic for crop CRUD operations

import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";

class CropService {
    // ─── Map Structured JSON to Flat DB Columns ────
    static #mapToDbFields(body) {
        const data = {};

        // ─── Basic Info ──────────────────────────────
        if (body.basicInfo) {
            const b = body.basicInfo;
            if (b.name !== undefined) data.name = b.name.trim();
            if (b.category !== undefined) data.category = b.category.trim();
            if (b.image !== undefined) data.image = b.image;
            if (b.description !== undefined) data.description = b.description;
            if (b.growingDuration !== undefined) data.growingDuration = b.growingDuration;
            if (b.season !== undefined) data.season = b.season.toUpperCase();
        }

        // ─── Geography ──────────────────────────────
        if (body.geography) {
            const g = body.geography;
            if (g.majorStates !== undefined) {
                data.majorRegions = g.majorStates;
                data.geoMajorStates = g.majorStates;
            }
            if (g.productionNotes !== undefined) data.geoProductionNotes = g.productionNotes;
            if (g.regionHighlight !== undefined) data.geoRegionHighlight = g.regionHighlight;
        }

        // ─── Soil Requirements ──────────────────────
        if (body.soilRequirements) {
            const s = body.soilRequirements;
            if (s.soilType !== undefined) data.soilType = s.soilType;
            if (s.phMin !== undefined) data.soilPhMin = parseFloat(s.phMin);
            if (s.phMax !== undefined) data.soilPhMax = parseFloat(s.phMax);
            if (s.preparationSteps !== undefined) data.soilPreparation = s.preparationSteps;
            if (s.testingTips !== undefined) data.soilTestingTips = s.testingTips;
        }

        // ─── Weather & Climate ──────────────────────
        if (body.weatherClimate) {
            const w = body.weatherClimate;
            if (w.tempRange !== undefined) data.weatherTempRange = w.tempRange;
            if (w.annualRainfall !== undefined) data.weatherRainfall = w.annualRainfall;
            if (w.humidityLevels !== undefined) data.weatherHumidity = w.humidityLevels;
            if (w.warningAlert !== undefined) data.weatherWarningAlert = w.warningAlert;
        }

        // ─── Water & Irrigation ─────────────────────
        if (body.waterIrrigation) {
            const i = body.waterIrrigation;
            if (i.method !== undefined) {
                data.waterRequirement = i.method;
                data.irrigationMethod = i.method;
            }
            if (i.frequency !== undefined) data.irrigationFrequency = i.frequency;
            if (i.savingTips !== undefined) data.irrigationSavingTips = i.savingTips;
            if (i.smartTech !== undefined) data.irrigationSmartTech = i.smartTech;
            if (i.subSurfaceSaving !== undefined) data.irrigationSubSurface = i.subSurfaceSaving;
        }

        // ─── Seed Management ────────────────────────
        if (body.seedManagement) {
            const sm = body.seedManagement;
            if (sm.variety !== undefined) data.seedVariety = sm.variety;
            if (sm.isHybrid !== undefined) data.seedIsHybrid = Boolean(sm.isHybrid);
            if (sm.seedRate !== undefined) data.seedRate = sm.seedRate;
            if (sm.treatment !== undefined) data.seedTreatment = sm.treatment;
        }

        // ─── Disease & Pest ─────────────────────────
        if (body.diseasePest) {
            const d = body.diseasePest;
            if (d.diseaseName !== undefined) data.diseaseName = d.diseaseName;
            if (d.symptoms !== undefined) data.diseaseSymptoms = d.symptoms;
            if (d.prevention !== undefined) data.diseasePrevention = d.prevention;
            if (d.treatment !== undefined) data.diseaseTreatment = d.treatment;
        }

        // ─── Market Insights ────────────────────────
        if (body.marketInsights) {
            const m = body.marketInsights;
            if (m.avgPrice !== undefined) data.marketAvgPrice = parseFloat(m.avgPrice);
            if (m.peakDemandSeason !== undefined) data.marketPeakSeason = m.peakDemandSeason;
            if (m.priceTrend !== undefined) data.marketPriceTrend = m.priceTrend;
        }

        // ─── Business Analysis ──────────────────────
        if (body.businessAnalysis) {
            const ba = body.businessAnalysis;
            if (ba.seedCost !== undefined) data.bizSeedCost = parseFloat(ba.seedCost);
            if (ba.fertilizerCost !== undefined) data.bizFertilizerCost = parseFloat(ba.fertilizerCost);
            if (ba.laborCost !== undefined) data.bizLaborCost = parseFloat(ba.laborCost);
            if (ba.irrigationCost !== undefined) data.bizIrrigationCost = parseFloat(ba.irrigationCost);
            if (ba.expectedYield !== undefined) data.bizExpectedYield = parseFloat(ba.expectedYield);
        }

        return data;
    }

    // ─── Map Flat DB Record to Structured JSON ─────
    static #mapToResponse(crop) {
        return {
            id: crop.id,
            basicInfo: {
                name: crop.name,
                category: crop.category,
                image: crop.image,
                description: crop.description,
                growingDuration: crop.growingDuration,
                season: crop.season,
            },
            geography: {
                majorStates: crop.geoMajorStates,
                productionNotes: crop.geoProductionNotes,
                regionHighlight: crop.geoRegionHighlight,
            },
            soilRequirements: {
                soilType: crop.soilType,
                phMin: crop.soilPhMin,
                phMax: crop.soilPhMax,
                preparationSteps: crop.soilPreparation,
                testingTips: crop.soilTestingTips,
            },
            weatherClimate: {
                tempRange: crop.weatherTempRange,
                annualRainfall: crop.weatherRainfall,
                humidityLevels: crop.weatherHumidity,
                warningAlert: crop.weatherWarningAlert,
            },
            waterIrrigation: {
                method: crop.irrigationMethod,
                frequency: crop.irrigationFrequency,
                savingTips: crop.irrigationSavingTips,
                smartTech: crop.irrigationSmartTech,
                subSurfaceSaving: crop.irrigationSubSurface,
            },
            seedManagement: {
                variety: crop.seedVariety,
                isHybrid: crop.seedIsHybrid,
                seedRate: crop.seedRate,
                treatment: crop.seedTreatment,
            },
            diseasePest: {
                diseaseName: crop.diseaseName,
                symptoms: crop.diseaseSymptoms,
                prevention: crop.diseasePrevention,
                treatment: crop.diseaseTreatment,
            },
            marketInsights: {
                avgPrice: crop.marketAvgPrice,
                peakDemandSeason: crop.marketPeakSeason,
                priceTrend: crop.marketPriceTrend,
            },
            businessAnalysis: {
                seedCost: crop.bizSeedCost,
                fertilizerCost: crop.bizFertilizerCost,
                laborCost: crop.bizLaborCost,
                irrigationCost: crop.bizIrrigationCost,
                expectedYield: crop.bizExpectedYield,
            },
            createdAt: crop.createdAt,
            updatedAt: crop.updatedAt,
        };
    }

    // ─── Get All Crops (with search, filter, paginate) ─
    static async getAll(query) {
        const { search, season, soilType } = query;

        // Build where clause (exclude soft-deleted)
        const where = { deletedAt: null };

        if (search) {
            where.name = { contains: search, mode: "insensitive" };
        }

        if (season) {
            where.season = season.toUpperCase();
        }

        if (soilType) {
            where.soilType = { contains: soilType, mode: "insensitive" };
        }

        // Count total for pagination
        const total = await prisma.crop.count({ where });

        // Pagination
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);

        // Fetch crops
        const crops = await prisma.crop.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                category: true,
                season: true,
                image: true,
                soilType: true,
                waterRequirement: true,
                growingDuration: true,
                yield: true,
                majorRegions: true,
            },
        });

        // Map to response format matching API spec
        const data = crops.map((crop) => ({
            id: crop.id,
            name: crop.name,
            category: crop.category,
            season: crop.season,
            image: crop.image,
            soilType: crop.soilType,
            waterRequirement: crop.waterRequirement,
            period: crop.growingDuration,
            yield: crop.yield,
            majorRegions: crop.majorRegions,
        }));

        return {
            data,
            pagination: { total, page, limit, totalPages },
        };
    }

    // ─── Get Single Crop ───────────────────────────
    static async getById(id) {
        const crop = await prisma.crop.findFirst({
            where: { id, deletedAt: null },
        });

        if (!crop) {
            throw ApiError.notFound("Crop not found");
        }

        return this.#mapToResponse(crop);
    }

    // ─── Create Crop ───────────────────────────────
    static async create(body) {
        const data = this.#mapToDbFields(body);

        const crop = await prisma.crop.create({ data });

        return this.#mapToResponse(crop);
    }

    // ─── Update Crop ───────────────────────────────
    static async update(id, body) {
        // Check existence
        const existing = await prisma.crop.findFirst({
            where: { id, deletedAt: null },
        });

        if (!existing) {
            throw ApiError.notFound("Crop not found");
        }

        const data = this.#mapToDbFields(body);

        const crop = await prisma.crop.update({
            where: { id },
            data,
        });

        return this.#mapToResponse(crop);
    }

    // ─── Soft Delete Crop ──────────────────────────
    static async delete(id) {
        const existing = await prisma.crop.findFirst({
            where: { id, deletedAt: null },
        });

        if (!existing) {
            throw ApiError.notFound("Crop not found");
        }

        await prisma.crop.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return true;
    }
}

export default CropService;
