import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type PublicContext = Omit<TrpcContext, "user"> & { user: null };
type AdminContext = TrpcContext & { user: NonNullable<TrpcContext["user"]> & { role: "admin" } };

function createPublicContext(): PublicContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): AdminContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin procedures", () => {
  describe("inquiries.list", () => {
    it("should allow admin to list inquiries", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users from listing inquiries", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiries.list();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toMatch(/Unauthorized|Please login/);
      }
    });
  });

  describe("inquiries.updateStatus", () => {
    it("should allow admin to update inquiry status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.updateStatus({
        id: 1,
        status: "contacted",
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users from updating inquiry status", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiries.updateStatus({
          id: 1,
          status: "contacted",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toMatch(/Unauthorized|Please login/);
      }
    });

    it("should reject invalid status values", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiries.updateStatus({
          id: 1,
          status: "invalid" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("portfolio.create", () => {
    it("should allow admin to create portfolio item", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.create({
        title: "โครงการทดสอบแอดมิน",
        category: "pipe-cleaning",
        description: "รายละเอียดการทดสอบ",
      });

      expect(result).toBeDefined();
    });

    it("should reject non-admin users from creating portfolio item", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.portfolio.create({
          title: "โครงการทดสอบ",
          category: "pipe-cleaning",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toMatch(/Unauthorized|Please login/);
      }
    });
  });
});
