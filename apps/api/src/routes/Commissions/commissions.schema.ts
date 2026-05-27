import { z } from 'zod';

export const updateCommissionStatusSchema = z.object({
    status: z.enum(['pending', 'paid'], {
        // التعديل هنا: استخدام message بدلاً من required_error
        message: "الحالة مطلوبة ويجب أن تكون pending أو paid",
    }),
});