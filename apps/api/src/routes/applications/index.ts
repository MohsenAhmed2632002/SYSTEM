import { FastifyPluginAsync } from "fastify";
import { ApplicationStatus } from "@prisma/client";

// ============================================================
// Applications Routes (Fully Secured & Optimized)
//
// GET  /api/applications            → list all applications
// GET  /api/applications/:id        → get single application
// POST /api/applications            → create application
// PUT  /api/applications/:id/status   → update status + auto commission
// ============================================================

const applicationRoutes: FastifyPluginAsync = async (fastify) => {

    // ── GET /api/applications ──────────────────────────────────
    fastify.get("/", async (request, reply) => {
        const applications = await fastify.prisma.application.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                candidate: {
                    select: { id: true, name: true, phone: true, level: true },
                },
                offer: {
                    select: { id: true, title: true, company: true, commission: true },
                },
            },
        });

        return reply.send(applications);
    });

    // ── GET /api/applications/:id ──────────────────────────────
    fastify.get<{ Params: { id: string } }>(
        "/:id",
        async (request, reply) => {
            const { id } = request.params;

            const application = await fastify.prisma.application.findUnique({
                where: { id },
                include: {
                    candidate: true,
                    offer: true,
                    commission: true,
                },
            });

            if (!application) {
                return reply.status(404).send({
                    success: false,
                    error: "Application not found",
                });
            }

            return reply.send(application);
        }
    );

    // ── POST /api/applications ─────────────────────────────────
    fastify.post<{
        Body: {
            candidateId: string;
            offerId: string;
            source?: string;
            assignedTo?: string;
        };
    }>(
        "/",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["candidateId", "offerId"],
                    properties: {
                        candidateId: { type: "string" },
                        offerId: { type: "string" },
                        source: { type: "string" },
                        assignedTo: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const { candidateId, offerId, source, assignedTo } = request.body;

            // التحقق من وجود الـ Candidate والـ Offer في قاعدة البيانات أولاً لمنع أخطاء العلاقات
            const candidate = await fastify.prisma.candidate.findUnique({ where: { id: candidateId } });
            const offer = await fastify.prisma.offer.findUnique({ where: { id: offerId } });

            if (!candidate || !offer) {
                return reply.status(400).send({
                    success: false,
                    error: "Either Candidate or Offer ID is invalid and does not exist.",
                });
            }

            const application = await fastify.prisma.application.create({
                data: {
                    candidateId,
                    offerId,
                    source: source ?? null,
                    assignedTo: assignedTo ?? null,
                    status: "applied",
                },
            });

            return reply.status(201).send({
                id: application.id,
                message: "Application created successfully",
            });
        }
    );

    // ── PUT /api/applications/:id/status ──────────────────────
    // ⭐ عند تحويل الحالة إلى accepted يتم توليد العمولة تلقائياً بأمان عبر Transaction
    fastify.put<{
        Params: { id: string };
        Body: { status: ApplicationStatus };
    }>(
        "/:id/status",
        {
            schema: {
                params: {
                    type: "object",
                    required: ["id"],
                    properties: { id: { type: "string" } },
                },
                body: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: {
                            type: "string",
                            enum: ["applied", "interview", "accepted", "rejected"],
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const { status } = request.body;

            // 1. جلب الطلب والعرض المرتبط به بشكل آمن للتحقق من وجوده
            const application = await fastify.prisma.application.findUnique({
                where: { id },
                include: { offer: true },
            });

            if (!application) {
                return reply.status(404).send({
                    success: false,
                    error: "Application not found in database",
                });
            }

            // 2. إذا كانت الحالة 'accepted' نقوم بعمل تحديث وإنشاء عمولة داخل Transaction آمن
            if (status === "accepted") {
                const offer = application.offer;

                if (!offer) {
                    return reply.status(400).send({
                        success: false,
                        error: "This application does not have a valid offer attached to it.",
                    });
                }

                // نتحقق إذا كانت العمولة قد أُنشئت بالفعل سابقاً لمنع التكرار
                const existingCommission = await fastify.prisma.commission.findUnique({
                    where: { applicationId: id },
                });

                if (!existingCommission) {
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + offer.commissionDelay);

                    // تشغيل العمليتين معاً بحسم وأمان
                    await fastify.prisma.$transaction([
                        fastify.prisma.application.update({
                            where: { id },
                            data: { status },
                        }),
                        fastify.prisma.commission.create({
                            data: {
                                applicationId: id,
                                offerId: offer.id,
                                candidateId: application.candidateId,
                                amount: offer.commission,
                                status: "pending",
                                earnedAt: new Date(),
                                dueDate,
                            },
                        }),
                    ]);

                    return reply.send({
                        success: true,
                        message: "Status updated to accepted and commission generated successfully."
                    });
                }
            }

            // 3. إذا كانت الحالة أي شيء آخر (أو العمولة موجودة بالفعل)، نكتفي بتحديث الحالة فقط
            await fastify.prisma.application.update({
                where: { id },
                data: { status },
            });

            return reply.send({ success: true, message: `Status updated successfully to ${status}.` });
        }
    );
};

export default applicationRoutes;