import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("admin.login", () => {
  it("should fail with incorrect username", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.login({
        username: "nonexistent",
        password: "password123",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBe("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  });

  it("should fail with incorrect password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.login({
        username: "admin",
        password: "wrongpassword",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toBe("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  });

  it("should require username and password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.login({
        username: "",
        password: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("too_small");
    }
  });
});
