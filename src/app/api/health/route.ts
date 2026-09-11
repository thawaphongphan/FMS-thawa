import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/infra/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ping the database to verify active connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        uptime: Math.floor(process.uptime()),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database check failed";
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: process.env.NODE_ENV === "production" ? "Database unavailable" : message,
      },
      { status: 503 }
    );
  }
}
