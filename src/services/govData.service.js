import axios from "axios";

import env from "../config/env.js";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";

class GovDataService {
    static #cache = new Map();
    static #cacheTtlMs = 5 * 60 * 1000;
    static #maxLimit = 500;
    static #defaultLimit = 50;

    static #buildParams(params = {}) {
        const searchParams = new URLSearchParams();

        searchParams.set("api-key", env.govData.apiKey);
        searchParams.set("format", "json");
        searchParams.set("limit", String(params.limit));
        searchParams.set("offset", String(params.offset));

        if (params.state) {
            searchParams.set("filters[state.keyword]", params.state);
        }
        if (params.district) {
            searchParams.set("filters[district]", params.district);
        }
        if (params.market) {
            searchParams.set("filters[market]", params.market);
        }
        if (params.commodity) {
            searchParams.set("filters[commodity]", params.commodity);
        }

        return searchParams;
    }

    static #normalizeString(value, fieldName) {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        if (typeof value !== "string") {
            throw ApiError.badRequest(`${fieldName} must be a string`);
        }

        const normalized = value.trim();

        if (!normalized) {
            throw ApiError.badRequest(`${fieldName} cannot be empty`);
        }

        return normalized;
    }

    static #parsePositiveInt(value, fallback, fieldName, { min = 0, max } = {}) {
        if (value === undefined || value === null || value === "") {
            return fallback;
        }

        const parsed = Number.parseInt(value, 10);

        if (Number.isNaN(parsed)) {
            throw ApiError.badRequest(`${fieldName} must be an integer`);
        }

        if (parsed < min) {
            throw ApiError.badRequest(`${fieldName} must be at least ${min}`);
        }

        if (max !== undefined && parsed > max) {
            throw ApiError.badRequest(`${fieldName} cannot be greater than ${max}`);
        }

        return parsed;
    }

    static #normalizeQuery(query = {}) {
        return {
            state: this.#normalizeString(query.state, "state"),
            district: this.#normalizeString(query.district, "district"),
            market: this.#normalizeString(query.market, "market"),
            commodity: this.#normalizeString(query.commodity, "commodity"),
            limit: this.#parsePositiveInt(query.limit, this.#defaultLimit, "limit", {
                min: 1,
                max: this.#maxLimit,
            }),
            offset: this.#parsePositiveInt(query.offset, 0, "offset", { min: 0 }),
            noCache: query.noCache === true || query.noCache === "true",
        };
    }

    static #cacheKey(params) {
        return JSON.stringify({
            state: params.state || null,
            district: params.district || null,
            market: params.market || null,
            commodity: params.commodity || null,
            limit: params.limit,
            offset: params.offset,
        });
    }

    static #getCached(key) {
        const entry = this.#cache.get(key);

        if (!entry) {
            return null;
        }

        if (entry.expiresAt <= Date.now()) {
            this.#cache.delete(key);
            return null;
        }

        return entry.value;
    }

    static #setCached(key, value) {
        this.#cache.set(key, {
            value,
            expiresAt: Date.now() + this.#cacheTtlMs,
        });
    }

    static #parseDate(dateStr) {
        if (!dateStr) return new Date();

        const parts = dateStr.split("/");
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }

        return new Date(dateStr);
    }

    static #toNumber(value) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    static #transformRecord(record = {}) {
        return {
            state: record.state || "",
            district: record.district || "",
            market: record.market || "",
            commodity: record.commodity || "",
            variety: record.variety || null,
            grade: record.grade || null,
            arrivalDate: record.arrival_date || "",
            prices: {
                min: this.#toNumber(record.min_price),
                max: this.#toNumber(record.max_price),
                modal: this.#toNumber(record.modal_price),
                unit: "Quintal",
            },
        };
    }

    static async fetchLive(query = {}) {
        if (!env.govData.apiKey) {
            throw ApiError.internal("Government Data API key is not configured");
        }

        const normalizedQuery = this.#normalizeQuery(query);
        const cacheKey = this.#cacheKey(normalizedQuery);

        if (!normalizedQuery.noCache) {
            const cached = this.#getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        try {
            const response = await axios.get(
                `${env.govData.baseUrl}/${env.govData.resourceId}`,
                {
                    params: this.#buildParams(normalizedQuery),
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            const data = response.data || {};
            const records = Array.isArray(data.records)
                ? data.records.map((record) => this.#transformRecord(record))
                : [];

            const result = {
                source: {
                    name: "data.gov.in",
                    resourceId: env.govData.resourceId,
                },
                filters: {
                    state: normalizedQuery.state || null,
                    district: normalizedQuery.district || null,
                    market: normalizedQuery.market || null,
                    commodity: normalizedQuery.commodity || null,
                },
                pagination: {
                    limit: normalizedQuery.limit,
                    offset: normalizedQuery.offset,
                    count: Number(data.count) || records.length,
                    total: Number(data.total) || records.length,
                },
                records,
            };

            if (!normalizedQuery.noCache) {
                this.#setCached(cacheKey, result);
            }

            return result;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 400) {
                    throw ApiError.badRequest("Invalid mandi price filters were sent to the government API");
                }

                if (status === 403) {
                    throw ApiError.internal("Government API key is invalid or expired");
                }

                if (status === 429) {
                    throw new ApiError(429, "Government API rate limit exceeded. Please try again later.");
                }

                throw ApiError.internal(
                    `Failed to fetch mandi prices from Government API${status ? ` (status ${status})` : ""}`
                );
            }

            throw ApiError.internal(`Failed to fetch mandi prices: ${error.message}`);
        }
    }

    static async syncToDatabase(query = {}) {
        const liveData = await this.fetchLive({
            ...query,
            limit: query.limit || "500",
            noCache: true,
        });

        if (liveData.records.length === 0) {
            return { synced: 0, message: "No records found to sync" };
        }

        const marketPriceData = liveData.records.map((record) => ({
            commodity: record.commodity,
            variety: record.variety,
            market: record.market,
            district: record.district,
            state: record.state,
            minPrice: record.prices.min,
            maxPrice: record.prices.max,
            modalPrice: record.prices.modal,
            unit: record.prices.unit,
            priceDate: this.#parseDate(record.arrivalDate),
            source: "data.gov.in",
        }));

        let synced = 0;
        const batchSize = 50;

        for (let i = 0; i < marketPriceData.length; i += batchSize) {
            const batch = marketPriceData.slice(i, i + batchSize);

            for (const record of batch) {
                try {
                    const existing = await prisma.marketPrice.findFirst({
                        where: {
                            commodity: record.commodity,
                            market: record.market,
                            priceDate: record.priceDate,
                            variety: record.variety,
                        },
                    });

                    if (existing) {
                        await prisma.marketPrice.update({
                            where: { id: existing.id },
                            data: {
                                minPrice: record.minPrice,
                                maxPrice: record.maxPrice,
                                modalPrice: record.modalPrice,
                            },
                        });
                    } else {
                        await prisma.marketPrice.create({ data: record });
                    }

                    synced++;
                } catch (error) {
                    console.error(
                        `Failed to sync record: ${record.commodity} - ${record.market}`,
                        error.message
                    );
                }
            }
        }

        return {
            synced,
            total: liveData.records.length,
            message: `${synced} records synced successfully from data.gov.in`,
        };
    }

    static async fetchStates() {
        const data = await this.fetchLive({ limit: "500" });
        return [...new Set(data.records.map((record) => record.state).filter(Boolean))].sort();
    }

    static async fetchCommodities(query = {}) {
        const data = await this.fetchLive({
            limit: "500",
            state: query.state,
        });

        return [...new Set(data.records.map((record) => record.commodity).filter(Boolean))].sort();
    }

    static async fetchMarkets(query = {}) {
        const data = await this.fetchLive({
            limit: "500",
            state: query.state,
            district: query.district,
        });

        return [...new Set(data.records.map((record) => record.market).filter(Boolean))].sort();
    }

    static async searchCommodity(commodity, query = {}) {
        return this.fetchLive({
            commodity,
            state: query.state,
            market: query.market,
            limit: query.limit || "100",
            offset: query.offset || "0",
        });
    }
}

export default GovDataService;
