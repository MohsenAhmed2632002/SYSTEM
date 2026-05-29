import { FastifyPluginAsync } from "fastify";
import type {
    CreateCandidateDto,
    CreateCandidateResponse,
    Candidate,
} from "@techia/types";

// ============================================================
// Candidates Routes
//
// GET  /api/candidates  → list all candidates
// POST /api/candidates  → create candidate
// ============================================================

const candidateRoutes: FastifyPluginAsync = async (fastify) => {

    // ── GET /api/candidates ──────────────────────────────────
    fastify.get("/", async (_request, reply) => {
        const candidates: Candidate[] = await fastify.prisma.candidate.findMany({
            orderBy: { createdAt: "desc" },
        });

        return reply.send(candidates);
    });

    // ── POST /api/candidates ─────────────────────────────────
    fastify.post<{ Body: CreateCandidateDto }>(
        "/",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["name", "phone"],
                    properties: {
                        name: { type: "string", minLength: 1 },
                        phone: { type: "string", minLength: 1 },
                        email: { type: "string", format: "email" },
                        level: {
                            type: "string",
                            enum: ["junior", "mid", "senior", "lead"],
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { name, phone, email, level } = request.body;

            const candidate = await fastify.prisma.candidate.create({
                data: {
                    name,
                    phone,
                    email: email ?? null,
                    level: level ?? "junior",
                },
            });

            const response: CreateCandidateResponse = {
                id: candidate.id,
                message: "Candidate created",
            };

            return reply.status(201).send(response);
        }
    );
};

export default candidateRoutes;