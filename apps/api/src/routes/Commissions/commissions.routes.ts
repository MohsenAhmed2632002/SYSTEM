import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { updateCommissionStatusSchema } from './commissions.schema';

const prisma = new PrismaClient();

export default async function commissionsRoutes(fastify: FastifyInstance) {

    // 1. جلب جميع العمولات مع تفاصيل العرض والمرشح (GET /api/commissions)
    fastify.get('/', async (request, reply) => {
        try {
            const commissions = await prisma.commission.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    offer: { select: { title: true, company: true } },
                    candidate: { select: { name: true, phone: true } },
                },
            });
            return reply.code(200).send(commissions);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: "حدث خطأ أثناء جلب العمولات" });
        }
    });

    // 2. تحديث حالة العمولة (مثلاً لدفعها) (PATCH /api/commissions/:id/status)
    fastify.patch<{ Params: { id: string } }>('/:id/status', async (request, reply) => {
        try {
            const { id } = request.params;
            const parsedData = updateCommissionStatusSchema.parse(request.body);

            // التأكد من وجود العمولة أولاً
            const existingCommission = await prisma.commission.findUnique({
                where: { id },
            });

            if (!existingCommission) {
                return reply.code(404).send({ error: "العمولة غير موجودة" });
            }

            // تحديث الحالة
            const updatedCommission = await prisma.commission.update({
                where: { id },
                data: { status: parsedData.status },
            });

            return reply.code(200).send({
                message: "تم تحديث حالة العمولة بنجاح",
                commission: updatedCommission,
            });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.code(400).send({ error: "بيانات غير صالحة", details: error.errors });
            }
            fastify.log.error(error);
            return reply.code(500).send({ error: "حدث خطأ في السيرفر" });
        }
    });
}