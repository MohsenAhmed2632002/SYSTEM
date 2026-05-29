import "dotenv/config";

import Fastify from "fastify";
import { config } from "./config";

// Plugins
import databasePlugin from "./plugins/database";
import corsPlugin from "./plugins/cors";
import errorHandlerPlugin from "./plugins/error-handler";

// Routes
import candidateRoutes from "./routes/candidates";
import applicationRoutes from "./routes/applications";
import offerRoutes from "./routes/offers/offers.routes";
import commissionRoutes from "./routes/Commissions/commissions.routes";

// ============================================================
// Logger — pino-pretty في dev، JSON في production
// ============================================================

const logger =
    config.nodeEnv === "development"
        ? {
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "HH:MM:ss",
                    ignore: "pid,hostname",
                    colorize: true,
                },
            },
        }
        : true;

// ============================================================
// App Instance
// ============================================================

const app = Fastify({ logger });

// ============================================================
// Bootstrap
// ============================================================

const start = async () => {
    // ── Plugins (الترتيب مهم) ─────────────────────────────────
    await app.register(errorHandlerPlugin); // الأول دايماً
    await app.register(corsPlugin);
    await app.register(databasePlugin);

    // ── Routes ────────────────────────────────────────────────
    await app.register(candidateRoutes, { prefix: "/api/candidates" });
    await app.register(applicationRoutes, { prefix: "/api/applications" });
    await app.register(offerRoutes, { prefix: "/api/offers" });
    await app.register(commissionRoutes, { prefix: "/api/commissions" });

    // ── Health Check ──────────────────────────────────────────
    app.get("/health", async () => ({
        status: "ok",
        env: config.nodeEnv,
        timestamp: new Date().toISOString(),
    }));

    app.get("/", async () => ({ message: "ATS API Running 🚀" }));

    // ── Listen ────────────────────────────────────────────────
    await app.listen({ port: config.port, host: config.host });
};

// ============================================================
// Graceful Shutdown
// ============================================================

const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C
process.on("SIGTERM", () => shutdown("SIGTERM"));  // Docker stop

// ============================================================
// Start
// ============================================================

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});