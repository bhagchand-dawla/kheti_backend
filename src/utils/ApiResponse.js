// ─── Standardized API Response ────────────────────

class ApiResponse {
    static success(res, data, statusCode = 200, meta = {}) {
        const response = {
            success: true,
            data,
            ...meta,
        };
        return res.status(statusCode).json(response);
    }

    static created(res, data, message = "Resource created successfully") {
        return res.status(201).json({
            success: true,
            message,
            data,
        });
    }

    static paginated(res, data, pagination) {
        return res.status(200).json({
            success: true,
            data,
            pagination,
        });
    }

    static message(res, message, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
        });
    }

    static error(res, statusCode, message, errors = []) {
        const response = {
            success: false,
            message,
        };
        if (errors.length > 0) {
            response.errors = errors;
        }
        return res.status(statusCode).json(response);
    }
}

export default ApiResponse;
