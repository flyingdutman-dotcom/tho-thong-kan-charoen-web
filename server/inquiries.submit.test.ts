import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type PublicContext = Omit<TrpcContext, "user"> & { user: null };

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

describe("inquiries.submit", () => {
  it("should successfully submit an inquiry with required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inquiries.submit({
      name: "สมชาย ใจดี",
      phone: "0812345678",
      serviceType: "pipe-cleaning",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should successfully submit an inquiry with optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inquiries.submit({
      name: "สมหญิง สวยงาม",
      phone: "0898765432",
      serviceType: "pipe-cleaning",
      email: "somying@example.com",
      message: "ท่อตันในห้องน้ำ",
    });

    expect(result.success).toBe(true);
    expect(typeof result.id).toBe("number");
  });

  it("should reject inquiry with missing name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.inquiries.submit({
        name: "",
        phone: "0812345678",
        serviceType: "pipe-cleaning",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("ชื่อจำเป็นต้องระบุ");
    }
  });

  it("should reject inquiry with invalid phone number", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.inquiries.submit({
        name: "สมชาย ใจดี",
        phone: "123",
        serviceType: "pipe-cleaning",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("เบอร์โทรศัพท์ไม่ถูกต้อง");
    }
  });

  it("should reject inquiry with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.inquiries.submit({
        name: "สมชาย ใจดี",
        phone: "0812345678",
        serviceType: "pipe-cleaning",
        email: "invalid-email",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("อีเมลไม่ถูกต้อง");
    }
  });

  it("should reject inquiry with missing service type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.inquiries.submit({
        name: "สมชาย ใจดี",
        phone: "0812345678",
        serviceType: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("ประเภทบริการจำเป็นต้องระบุ");
    }
  });
});
