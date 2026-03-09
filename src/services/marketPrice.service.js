// ─── Market Price Service ─────────────────────────
// Business logic for market price CRUD operations

import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";

class MarketPriceService {
    // ─── Get All Market Prices (search, filter, paginate) ─
    static async getAll(query) {
        const { search, state, market, commodity, startDate, endDate, cropId } = query;

        // Build where clause
        const where = {};

        if (search) {
            where.OR = [
                { commodity: { contains: search, mode: "insensitive" } },
                { market: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
            ];
        }

        if (commodity) {
            where.commodity = { contains: commodity, mode: "insensitive" };
        }

        if (state) {
            where.state = { contains: state, mode: "insensitive" };
        }

        if (market) {
            where.market = { contains: market, mode: "insensitive" };
        }

        if (cropId) {
            where.cropId = cropId;
        }

        // Date range filter
        if (startDate || endDate) {
            where.priceDate = {};
            if (startDate) where.priceDate.gte = new Date(startDate);
            if (endDate) where.priceDate.lte = new Date(endDate);
        }

        // Count total
        const total = await prisma.marketPrice.count({ where });

        // Pagination
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);

        // Sort
        const sortBy = query.sortBy || "priceDate";
        const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

        // Fetch
        const prices = await prisma.marketPrice.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                crop: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        image: true,
                    },
                },
            },
        });

        return {
            data: prices,
            pagination: { total, page, limit, totalPages },
        };
    }

    // ─── Get Single Market Price ──────────────────────
    static async getById(id) {
        const price = await prisma.marketPrice.findUnique({
            where: { id },
            include: {
                crop: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        image: true,
                        season: true,
                    },
                },
            },
        });

        if (!price) {
            throw ApiError.notFound("Market price record not found");
        }

        return price;
    }

    // ─── Get Prices by Commodity ─────────────────────
    static async getByCommodity(commodity, query) {
        const where = {
            commodity: { contains: commodity, mode: "insensitive" },
        };

        if (query.state) {
            where.state = { contains: query.state, mode: "insensitive" };
        }

        // Date range
        if (query.startDate || query.endDate) {
            where.priceDate = {};
            if (query.startDate) where.priceDate.gte = new Date(query.startDate);
            if (query.endDate) where.priceDate.lte = new Date(query.endDate);
        }

        const total = await prisma.marketPrice.count({ where });

        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);

        const prices = await prisma.marketPrice.findMany({
            where,
            skip,
            take: limit,
            orderBy: { priceDate: "desc" },
        });

        return {
            data: prices,
            pagination: { total, page, limit, totalPages },
        };
    }

    // ─── Create Market Price ─────────────────────────
    static async create(body) {
        const data = {
            commodity: body.commodity.trim(),
            variety: body.variety?.trim() || null,
            market: body.market.trim(),
            district: body.district?.trim() || null,
            state: body.state.trim(),
            minPrice: parseFloat(body.minPrice),
            maxPrice: parseFloat(body.maxPrice),
            modalPrice: parseFloat(body.modalPrice),
            unit: body.unit || "Quintal",
            priceDate: new Date(body.priceDate),
            source: body.source?.trim() || null,
            cropId: body.cropId || null,
        };

        const price = await prisma.marketPrice.create({ data });

        return price;
    }

    // ─── Bulk Create (for importing data) ────────────
    static async bulkCreate(records) {
        const data = records.map((body) => ({
            commodity: body.commodity.trim(),
            variety: body.variety?.trim() || null,
            market: body.market.trim(),
            district: body.district?.trim() || null,
            state: body.state.trim(),
            minPrice: parseFloat(body.minPrice),
            maxPrice: parseFloat(body.maxPrice),
            modalPrice: parseFloat(body.modalPrice),
            unit: body.unit || "Quintal",
            priceDate: new Date(body.priceDate),
            source: body.source?.trim() || null,
            cropId: body.cropId || null,
        }));

        const result = await prisma.marketPrice.createMany({ data });

        return { count: result.count };
    }

    // ─── Update Market Price ─────────────────────────
    static async update(id, body) {
        const existing = await prisma.marketPrice.findUnique({
            where: { id },
        });

        if (!existing) {
            throw ApiError.notFound("Market price record not found");
        }

        const data = {};
        if (body.commodity !== undefined) data.commodity = body.commodity.trim();
        if (body.variety !== undefined) data.variety = body.variety?.trim() || null;
        if (body.market !== undefined) data.market = body.market.trim();
        if (body.district !== undefined) data.district = body.district?.trim() || null;
        if (body.state !== undefined) data.state = body.state.trim();
        if (body.minPrice !== undefined) data.minPrice = parseFloat(body.minPrice);
        if (body.maxPrice !== undefined) data.maxPrice = parseFloat(body.maxPrice);
        if (body.modalPrice !== undefined) data.modalPrice = parseFloat(body.modalPrice);
        if (body.unit !== undefined) data.unit = body.unit;
        if (body.priceDate !== undefined) data.priceDate = new Date(body.priceDate);
        if (body.source !== undefined) data.source = body.source?.trim() || null;
        if (body.cropId !== undefined) data.cropId = body.cropId || null;

        const price = await prisma.marketPrice.update({
            where: { id },
            data,
        });

        return price;
    }

    // ─── Delete Market Price ─────────────────────────
    static async delete(id) {
        const existing = await prisma.marketPrice.findUnique({
            where: { id },
        });

        if (!existing) {
            throw ApiError.notFound("Market price record not found");
        }

        await prisma.marketPrice.delete({
            where: { id },
        });

        return true;
    }

    // ─── Get Unique States (for filter dropdown) ─────
    static async getStates() {
        const states = await prisma.marketPrice.findMany({
            distinct: ["state"],
            select: { state: true },
            orderBy: { state: "asc" },
        });

        return states.map((s) => s.state);
    }

    // ─── Get Unique Commodities (for filter dropdown) ─
    static async getCommodities() {
        const commodities = await prisma.marketPrice.findMany({
            distinct: ["commodity"],
            select: { commodity: true },
            orderBy: { commodity: "asc" },
        });

        return commodities.map((c) => c.commodity);
    }

    // ─── Get Unique Markets (for filter dropdown) ────
    static async getMarkets(query) {
        const where = {};
        if (query.state) {
            where.state = { contains: query.state, mode: "insensitive" };
        }

        const markets = await prisma.marketPrice.findMany({
            where,
            distinct: ["market"],
            select: { market: true },
            orderBy: { market: "asc" },
        });

        return markets.map((m) => m.market);
    }
}

export default MarketPriceService;
