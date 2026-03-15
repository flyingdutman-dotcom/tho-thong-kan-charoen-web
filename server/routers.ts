import { COOKIE_NAME } from "@shared/const";
import { adminProcedure } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createInquiry, getInquiries, updateInquiryStatus, getPublishedPortfolio, getPortfolioById, createPortfolioItem, createReview, listPublishedReviews, listAllReviews, updateReviewStatus, deleteReview, createBooking, getBookings, getBookingById, updateBookingStatus, deleteBooking } from "./db";
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

  portfolio: router({
    list: publicProcedure.query(async () => {
      return await getPublishedPortfolio();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPortfolioById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1, "ชื่อโครงการจำเป็นต้องระบุ"),
          description: z.string().optional(),
          category: z.string().min(1, "หมวดหมู่จำเป็นต้องระบุ"),
          beforeImage: z.string().optional(),
          afterImage: z.string().optional(),
          location: z.string().optional(),
          completedDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return await createPortfolioItem({
          title: input.title,
          description: input.description || null,
          category: input.category,
          beforeImage: input.beforeImage || null,
          afterImage: input.afterImage || null,
          location: input.location || null,
          completedDate: input.completedDate || null,
        });
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

  reviews: router({
    list: publicProcedure.query(async () => {
      return await listPublishedReviews();
    }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return await listAllReviews();
    }),
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1, "ชื่อลูกค้าจำเป็นต้องระบุ"),
          customerEmail: z.string().email("อีเมลไม่ถูกต้อง").optional(),
          rating: z.number().min(1, "ต้องให้คะแนนอย่างน้อย 1 ดาว").max(5, "คะแนนสูงสุด 5 ดาว"),
          title: z.string().min(1, "หัวข้อรีวิวจำเป็นต้องระบุ"),
          content: z.string().min(10, "เนื้อหารีวิวต้องมีอย่างน้อย 10 ตัวอักษร"),
          serviceType: z.string().optional(),
          projectLocation: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createReview({
          customerName: input.customerName,
          customerEmail: input.customerEmail || null,
          rating: input.rating,
          title: input.title,
          content: input.content,
          serviceType: input.serviceType || null,
          projectLocation: input.projectLocation || null,
          isPublished: false,
        });
        return { success: true };
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          isPublished: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateReviewStatus(input.id, input.isPublished);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await deleteReview(input.id);
        return { success: true };
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerPhone: z.string().min(9),
          customerEmail: z.string().email().optional(),
          serviceType: z.string().min(1),
          bookingDate: z.date(),
          timeSlot: z.string().min(1),
          location: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const booking = await createBooking({
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail || null,
          serviceType: input.serviceType,
          bookingDate: input.bookingDate,
          timeSlot: input.timeSlot,
          location: input.location || null,
          notes: input.notes || null,
          status: "pending",
        });
        
        await notifyOwner({
          title: "มีการจองบริการใหม่",
          content: `${input.customerName} ได้จองบริการ ${input.serviceType}`,
        });
        
        return booking;
      }),
    list: adminProcedure.query(async () => {
      return await getBookings();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBookingById(input.id);
      }),
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateBookingStatus(input.id, input.status);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBooking(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
