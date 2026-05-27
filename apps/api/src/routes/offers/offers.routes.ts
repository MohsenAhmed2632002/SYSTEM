import { FastifyInstance } from 'fastify';
import { prisma } from '@techia/db'; // استدعاء Prisma من الـ Shared Package
import { createOfferSchema } from './offers.schema';

export default async function offersRoutes(fastify: FastifyInstance) {

    // 1. جلب جميع العروض (GET /api/offers)
    fastify.get('/', async (request, reply) => {
        try {
            const offers = await prisma.offer.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return reply.code(200).send(offers);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: "حدث خطأ أثناء جلب العروض" });
        }
    });

    // 2. إنشاء عرض جديد (POST /api/offers)
    fastify.post('/', async (request, reply) => {
        try {
            // التحقق من صحة البيانات باستخدام Zod
            const parsedData = createOfferSchema.parse(request.body);

            // حفظ في قاعدة البيانات عبر Prisma
            const newOffer = await prisma.offer.create({
                data: parsedData,
            });

            return reply.code(201).send({
                message: "تم إنشاء العرض بنجاح",
                offer: newOffer,
            });
        } catch (error: any) {
            // التقاط أخطاء Zod (Validation Errors)
            if (error.name === 'ZodError') {
                return reply.code(400).send({ error: "بيانات غير صالحة", details: error.errors });
            }
            fastify.log.error(error);
            return reply.code(500).send({ error: "حدث خطأ في السيرفر" });
        }
    });
}