import { PrismaClient } from "@prisma/client";

// ============================================================
// Prisma Client Singleton
// نمنع إنشاء أكثر من connection واحد في development
// (Next.js hot reload بيعمل مشكلة لو مش singleton)
// ============================================================

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;