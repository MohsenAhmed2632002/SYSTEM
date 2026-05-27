import Fastify from "fastify";

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
// Server Setup
// ============================================================

const app = Fastify({
    logger: true, // بدون pino-pretty عشان ما يعطلش
});

const start = async () => {
    // ── Plugins ───────────────────────────────────────────────
    await app.register(errorHandlerPlugin);
    await app.register(corsPlugin);
    await app.register(databasePlugin);

    // ── Routes ────────────────────────────────────────────────
    await app.register(candidateRoutes, { prefix: "/api/candidates" });
    await app.register(applicationRoutes, { prefix: "/api/applications" });
    await app.register(offerRoutes, { prefix: "/api/offers" });
    await app.register(commissionRoutes, { prefix: "/api/commissions" });

    // Health check
    app.get("/", async () => ({ message: "ATS API Running 🚀" }));

    // ── Start ─────────────────────────────────────────────────
    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
};

start().catch((err) => {
    console.error(err);
    process.exit(1);
});