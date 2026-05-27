import { FastifyPluginAsync } from "fastify";
import { CommissionStatus } from "@prisma/client";

// ============================================================
// Commissions Routes
//
// GET   /api/commissions          → list all commissions
// GET   /api/commissions/:id      → get single commission
// PATCH /api/commissions/:id/status → mark as paid
// ============================================================

const commissionRoutes: FastifyPluginAsync = async (fastify) => {

    // ── GET /api/commissions ───────────────────────────────────
    fastify.get("/", async (request, reply) => {
        const commissions = await fastify.prisma.commission.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                candidate: {
                    select: { id: true, name: true, phone: true },
                },
                offer: {
                    select: { id: true, title: true, company: true },
                },
            },
        });

        return reply.send(commissions);
    });

    // ── GET /api/commissions/:id ───────────────────────────────
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
                        select: { id: true, status: true, source: true },
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

    // ── PATCH /api/commissions/:id/status ─────────────────────
    // بيحوّل الـ status من pending → paid
    // نفس منطق: commissions.doc(id).update({ status: "paid" })
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

            const commission = await fastify.prisma.commission.update({
                where: { id },
                data: { status },
            });

            return reply.send({
                id: commission.id,
                status: commission.status,
                message: `Commission marked as ${status}`,
            });
        }
    );
};

export default commissionRoutes;