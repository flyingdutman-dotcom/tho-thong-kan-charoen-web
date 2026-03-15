import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createInquiry, getInquiries, updateInquiryStatus } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  inquiries: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "ชื่อจำเป็นต้องระบุ"),
          phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
          serviceType: z.string().min(1, "ประเภทบริการจำเป็นต้องระบุ"),
          email: z.string().email("อีเมลไม่ถูกต้อง").optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await createInquiry({
            name: input.name,
            phone: input.phone,
            serviceType: input.serviceType,
            email: input.email || null,
            message: input.message || null,
          });

          // Notify owner of new inquiry
          await notifyOwner({
            title: "ใบขอเสนอราคาใหม่",
            content: `ได้รับใบขอเสนอราคาจาก ${input.name} (${input.phone}) สำหรับบริการ: ${input.serviceType}`,
          });

          return { success: true, id: (result as any).insertId || 0 };
        } catch (error) {
          console.error("Failed to submit inquiry:", error);
          throw new Error("ไม่สามารถส่งใบขอเสนอราคาได้ กรุณาลองใหม่");
        }
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await getInquiries();
    }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "completed", "rejected"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateInquiryStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
