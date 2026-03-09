// ─── Government Data Service ──────────────────────
// Fetches market price data from data.gov.in API
// and syncs it with our MarketPrice database

import env from "../config/env.js";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";

class GovDataService {
    // ─── Build API URL ───────────────────────────────
    static #buildUrl(params = {}) {
        const url = new URL(`${env.govData.baseUrl}/${env.govData.resourceId}`);
        url.searchParams.set("api-key", env.govData.apiKey);
        url.searchParams.set("format", "json");

        // Default limit
        url.searchParams.set("limit", params.limit || "100");
        url.searchParams.set("offset", params.offset || "0");

        // Filters
        if (params.state) {
            url.searchParams.set("filters[state.keyword]", params.state);
        }
        if (params.district) {
            url.searchParams.set("filters[district]", params.district);
        }
        if (params.market) {
            url.searchParams.set("filters[market]", params.market);
        }
        if (params.commodity) {
            url.searchParams.set("filters[commodity]", params.commodity);
        }

        return url.toString();
    }

    // ─── Parse date from dd/mm/yyyy to Date ─────────
    static #parseDate(dateStr) {
        if (!dateStr) return new Date();
        const parts = dateStr.split("/");
        if (parts.length === 3) {
            // dd/mm/yyyy → yyyy-mm-dd
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(dateStr);
    }

    // ─── Fetch Live Data from Government API ────────
    static async fetchLive(query = {}) {
        if (!env.govData.apiKey) {
            throw ApiError.internal("Government Data API key is not configured");
        }

        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 50));
        const offset = Math.max(0, parseInt(query.offset, 10) || 0);

        const url = this.#buildUrl({
            limit: String(limit),
            offset: String(offset),
            state: query.state,
            district: query.district,
            market: query.market,
            commodity: query.commodity,
        });

        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new ApiError(429, "Government API rate limit exceeded. Please try again after a few minutes.");
                }
                if (response.status === 403) {
                    throw ApiError.internal("Government API key is invalid or expired. Check GOV_DATA_API_KEY in .env");
                }
                throw ApiError.internal(`Government API responded with status ${response.status}`);
            }

            const data = await response.json();

            // Transform records to our format
            const records = (data.records || []).map((record) => ({
                state: record.state || "",
                district: record.district || "",
                market: record.market || "",
                commodity: record.commodity || "",
                variety: record.variety || null,
                grade: record.grade || null,
                arrivalDate: record.arrival_date || "",
                minPrice: record.min_price || 0,
                maxPrice: record.max_price || 0,
                modalPrice: record.modal_price || 0,
            }));

            return {
                source: "data.gov.in",
                title: data.title || "Daily Commodity Prices",
                total: data.total || 0,
                count: data.count || records.length,
                limit,
                offset,
                records,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.internal(`Failed to fetch from Government API: ${error.message}`);
        }
    }

    // ─── Fetch & Sync: Save API Data to Our Database ─
    static async syncToDatabase(query = {}) {
        // First fetch live data
        const liveData = await this.fetchLive({
            ...query,
            limit: query.limit || "500",
        });

        if (liveData.records.length === 0) {
            return { synced: 0, message: "No records found to sync" };
        }

        // Map to our MarketPrice model format
        const marketPriceData = liveData.records.map((record) => ({
            commodity: record.commodity,
            variety: record.variety,
            market: record.market,
            district: record.district,
            state: record.state,
            minPrice: parseFloat(record.minPrice) || 0,
            maxPrice: parseFloat(record.maxPrice) || 0,
            modalPrice: parseFloat(record.modalPrice) || 0,
            unit: "Quintal",
            priceDate: this.#parseDate(record.arrivalDate),
            source: "data.gov.in",
        }));

        // Bulk upsert — avoid duplicates by checking commodity + market + priceDate
        let synced = 0;
        const batchSize = 50;

        for (let i = 0; i < marketPriceData.length; i += batchSize) {
            const batch = marketPriceData.slice(i, i + batchSize);

            for (const record of batch) {
                try {
                    // Check if a record already exists with same commodity, market, and date
                    const existing = await prisma.marketPrice.findFirst({
                        where: {
                            commodity: record.commodity,
                            market: record.market,
                            priceDate: record.priceDate,
                            variety: record.variety,
                        },
                    });

                    if (existing) {
                        // Update existing record prices
                        await prisma.marketPrice.update({
                            where: { id: existing.id },
                            data: {
                                minPrice: record.minPrice,
                                maxPrice: record.maxPrice,
                                modalPrice: record.modalPrice,
                            },
                        });
                    } else {
                        // Create new record
                        await prisma.marketPrice.create({ data: record });
                    }
                    synced++;
                } catch (err) {
                    console.error(`Failed to sync record: ${record.commodity} - ${record.market}`, err.message);
                }
            }
        }

        return {
            synced,
            total: liveData.records.length,
            message: `${synced} records synced successfully from data.gov.in`,
        };
    }

    // ─── Get Available States from Gov API ──────────
    static async fetchStates() {
        const data = await this.fetchLive({ limit: "500" });

        const states = [...new Set(data.records.map((r) => r.state))].sort();

        return states;
    }

    // ─── Get Available Commodities from Gov API ─────
    static async fetchCommodities(query = {}) {
        const data = await this.fetchLive({
            limit: "500",
            state: query.state,
        });

        const commodities = [...new Set(data.records.map((r) => r.commodity))].sort();

        return commodities;
    }

    // ─── Get Available Markets from Gov API ─────────
    static async fetchMarkets(query = {}) {
        const data = await this.fetchLive({
            limit: "500",
            state: query.state,
            district: query.district,
        });

        const markets = [...new Set(data.records.map((r) => r.market))].sort();

        return markets;
    }

    // ─── Search commodities by name (live) ──────────
    static async searchCommodity(commodity, query = {}) {
        const data = await this.fetchLive({
            commodity,
            state: query.state,
            market: query.market,
            limit: query.limit || "100",
            offset: query.offset || "0",
        });

        return data;
    }
}

export default GovDataService;
