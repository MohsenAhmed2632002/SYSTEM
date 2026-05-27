import { z } from 'zod';

// التحقق من البيانات عند إنشاء عرض جديد
export const createOfferSchema = z.object({
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
    company: z.string().optional(),
    description: z.string().optional(),
    commission: z.number().nonnegative().default(0),
    commissionDelay: z.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
});

// استخراج النوع (Type) لاستخدامه في TypeScript
export type CreateOfferInput = z.infer<typeof createOfferSchema>;