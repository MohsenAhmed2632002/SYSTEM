import { FastifyPluginAsync } from "fastify";
import { CommissionStatus } from "@prisma/client";

// ============================================================
// Commissions Routes
//
// GET   /api/commissions              → list all commissions
// GET   /api/commissions/:id          → get single commission
// PATCH /api/commissions/:id/status   → update commission status
// ============================================================

const commissionRoutes: FastifyPluginAsync = async (fastify) => {

    // ─────────────────────────────────────────────
    // GET ALL COMMISSIONS
    // ─────────────────────────────────────────────
    fastify.get("/", async (request, reply) => {
        const commissions = await fastify.prisma.commission.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                offer: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                    },
                },
            },
        });

        return reply.send(commissions);
    });

    // ─────────────────────────────────────────────
    // GET COMMISSION BY ID
    // ─────────────────────────────────────────────
    fastify.get<{ Params: { id: string } }>(
        "/:id",
        async (request, reply) => {
            const { id } = request.params;

            const commission = await fastify.prisma.commission.findUnique({
                where: { id },
                include: {
                    candidate: true,
                    offer: true,
                    application: {
                        select: {
                            id: true,
                            status: true,
                            source: true,
                        },
                    },
                },
            });

            if (!commission) {
                return reply.status(404).send({
                    success: false,
                    error: "Commission not found",
                });
            }

            return reply.send(commission);
        }
    );

    // ─────────────────────────────────────────────
    // UPDATE COMMISSION STATUS
    // ─────────────────────────────────────────────
    fastify.patch<{
        Params: { id: string };
        Body: { status: CommissionStatus };
    }>(
        "/:id/status",
        {
            schema: {
                params: {
                    type: "object",
                    required: ["id"],
                    properties: {
                        id: { type: "string" },
                    },
                },
                body: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["pending", "paid"],
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { status } = request.body;

            try {
                const commission = await fastify.prisma.commission.update({
                    where: { id },
                    data: { status },
                });

                return reply.send({
                    id: commission.id,
                    status: commission.status,
                    message: `Commission marked as ${status}`,
                });
            } catch (error) {
                return reply.status(404).send({
                    success: false,
                    error: "Commission not found or update failed",
                });
            }
        }
    );
};

export default commissionRoutes;