import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { prisma } from "@/shared/lib/infra/prisma";

describe("GET /api/health", () => {
  it("returns 200 ok when database is reachable", async () => {
    vi.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([{ "?column?": 1 }] as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.database).toBe("connected");
    expect(typeof data.uptime).toBe("number");
  });

  it("returns 503 error when database is unreachable", async () => {
    vi.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(new Error("Connection refused"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.status).toBe("error");
    expect(data.database).toBe("disconnected");
  });
});
