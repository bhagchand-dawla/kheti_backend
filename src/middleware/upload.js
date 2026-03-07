// ─── Multer Upload Middleware ─────────────────────
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

// ─── Storage Configuration ───────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve("src/uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    },
});

// ─── File Filter (Images Only) ───────────────────
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(ApiError.badRequest(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, and SVG are allowed.`), false);
    }
};

// ─── Multer Instance ─────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxSize,
    },
});

export default upload;
