import type { CorsOptions } from "cors";
import { env } from "./env.js";

const allowedOrigins = [
  env.FRONTEND_URL || "http://localhost:3000",
];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin (e.g., Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true,
};
