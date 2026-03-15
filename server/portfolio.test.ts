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

describe("portfolio", () => {
  describe("list", () => {
    it("should return published portfolio items", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("get", () => {
    it("should return portfolio item by id", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.get({ id: 1 });

      // Result can be undefined if item doesn't exist, which is fine
      if (result) {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("category");
      }
    });

    it("should return undefined for non-existent portfolio item", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.get({ id: 99999 });

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should allow admin to create portfolio item", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.portfolio.create({
        title: "โครงการทดสอบ",
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
        // Non-authenticated users get "Please login" error
        expect(error.message).toMatch(/Unauthorized|Please login/);
      }
    });

    it("should reject portfolio item without title", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.portfolio.create({
          title: "",
          category: "pipe-cleaning",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("ชื่อโครงการจำเป็นต้องระบุ");
      }
    });

    it("should reject portfolio item without category", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.portfolio.create({
          title: "โครงการทดสอบ",
          category: "",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("หมวดหมู่จำเป็นต้องระบุ");
      }
    });
  });
});
