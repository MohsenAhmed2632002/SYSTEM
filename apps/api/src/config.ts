// ============================================================
// Config — validates env vars at startup
// فشل هنا أفضل من فشل وسط الـ runtime
// ============================================================

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `\n❌ Missing required environment variable: ${key}\n` +
            `   Copy apps/api/.env.example to apps/api/.env and fill it in.\n`
        );
    }
    return value;
}

export const config = {
    port: Number(process.env.PORT) || 4000,
    host: process.env.HOST || "0.0.0.0",
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: requireEnv("DATABASE_URL"),
    corsOrigin: process.env.CORS_ORIGINS
        ?? process.env.CORS_ORIGIN
        ?? "http://localhost:3000",
} as const;