// ─── Pagination Helper ────────────────────────────

/**
 * Builds pagination metadata from query params.
 * @param {object} query - Express req.query
 * @param {number} total - Total record count
 * @returns {{ skip: number, take: number, pagination: object }}
 */
export const buildPagination = (query, total) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const totalPages = Math.ceil(total / limit);

    return {
        skip: (page - 1) * limit,
        take: limit,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};
