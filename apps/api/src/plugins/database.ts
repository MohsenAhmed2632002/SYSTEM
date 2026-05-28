import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

async function databasePlugin(fastify: FastifyInstance) {
    const prisma = new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

    await prisma.$connect();

    fastify.decorate("prisma", prisma);

    fastify.addHook("onClose", async (instance) => {
        await instance.prisma.$disconnect();
    });

    fastify.log.info("✅ Database connected");
}

export default fp(databasePlugin);