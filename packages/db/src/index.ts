// ============================================================
// @techia/db — Public API
// ============================================================

// Prisma client (الاستخدام الأساسي)
export { prisma, default } from "./client";

// Re-export كل Prisma types عشان باقي الـ packages تستخدمها
// بدل ما كل حاجة تعمل import من @prisma/client مباشرة
export type {
    Candidate,
    Application,
    Commission,
    Offer,
    ApplicationStatus,
    CommissionStatus,
    CandidateLevel,
    Prisma,
} from "@prisma/client";