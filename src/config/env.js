require("dotenv").config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function numberEnv(key, fallback) {
  const value = Number.parseInt(process.env[key], 10);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  authRateLimitWindowMs: numberEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  authRateLimitMax: numberEnv("AUTH_RATE_LIMIT_MAX", 5)
};
