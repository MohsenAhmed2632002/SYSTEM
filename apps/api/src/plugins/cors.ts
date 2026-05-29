// apps/api/src/plugins/cors.ts
import { FastifyInstance } from "fastify";

export default async function corsPlugin(fastify: FastifyInstance) {
    // دعم origin واحد أو قائمة مفصولة بفاصلة
    const rawOrigins = process.env.CORS_ORIGINS
        ?? process.env.CORS_ORIGIN
        ?? "http://localhost:3000";

    const allowedOrigins = rawOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    fastify.addHook("onRequest", async (request, reply) => {
        const requestOrigin = request.headers.origin;

        // السماح لـ Flutter mobile (مفيش origin header)
        if (!requestOrigin) {
            reply.header("Access-Control-Allow-Origin", "*");
        } else if (
            allowedOrigins.includes("*") ||
            allowedOrigins.includes(requestOrigin)
        ) {
            reply.header("Access-Control-Allow-Origin", requestOrigin);
        }

        reply.header(
            "Access-Control-Allow-Methods",
            "GET,POST,PUT,PATCH,DELETE,OPTIONS"
        );
        reply.header(
            "Access-Control-Allow-Headers",
            "Content-Type,Authorization"
        );
        reply.header("Access-Control-Allow-Credentials", "true");

        if (request.method === "OPTIONS") {
            return reply.status(204).send();
        }
    });
}