// ─── Database Configuration ───────────────────────
// Prisma Client singleton for connection pooling

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// ─── Graceful Shutdown ────────────────────────────
const gracefulShutdown = async () => {
  await prisma.$disconnect();
  console.log("📦 Database connection closed.");
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default prisma;
