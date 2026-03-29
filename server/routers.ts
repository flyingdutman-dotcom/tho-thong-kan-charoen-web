import { COOKIE_NAME } from "@shared/const";
import { adminProcedure } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createInquiry, getInquiries, updateInquiryStatus, deleteInquiry, getPublishedPortfolio, getPortfolioById, createPortfolioItem, deletePortfolio, createReview, listPublishedReviews, listAllReviews, updateReviewStatus, deleteReview, createBooking, getBookings, getBookingById, updateBookingStatus, deleteBooking, getAdminUserByUsername, updateAdminUserLastLogin, verifyPassword, hashPassword, createFAQ, getFAQs, getAllFAQs, updateFAQ, deleteFAQ, createDocument, getAllDocuments, getDocumentById, deleteDocument, createPurchaseRequisition, getPurchaseRequisitions, updatePurchaseRequisition, deletePurchaseRequisition, createPurchaseOrder, getPurchaseOrders, updatePurchaseOrder, deletePurchaseOrder, createStockRequisition, getStockRequisitions, updateStockRequisition, deleteStockRequisition, createJobOrder, getJobOrders, updateJobOrder, deleteJobOrder, createFieldServiceReport, getFieldServiceReports, updateFieldServiceReport, deleteFieldServiceReport, createDailyLog, getDailyLogs, updateDailyLog, deleteDailyLog, createQuotation, getQuotations, updateQuotation, deleteQuotation, createDeliveryOrder, getDeliveryOrders, updateDeliveryOrder, deleteDeliveryOrder, createInvoice, getInvoices, updateInvoice, deleteInvoice } from "./db";
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
    listAll: publicProcedure.query(async () => {
      // Public endpoint for admin pages using AdminContext (username/password login)
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
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePortfolio(input.id);
        return { success: true };
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
    listAdmin: publicProcedure.query(async () => {
      // Public endpoint for admin pages using AdminContext (username/password login)
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
    updateStatusAdmin: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "completed", "rejected"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateInquiryStatus(input.id, input.status);
        return { success: true };
      }),
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteInquiry(input.id);
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
    listAllAdmin: publicProcedure.query(async () => {
      // Public endpoint for admin pages using AdminContext (username/password login)
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
    updateStatusAdmin: publicProcedure
      .input(
        z.object({
          id: z.number(),
          isPublished: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
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
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteReview(input.id);
        return { success: true };
      }),
  }),

  admin: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const adminUser = await getAdminUserByUsername(input.username);
          if (!adminUser) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
            });
          }

          // Verify password with bcrypt
          const isPasswordValid = await verifyPassword(input.password, adminUser.password);
          if (!isPasswordValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
            });
          }

          await updateAdminUserLastLogin(adminUser.id);
          return { success: true, adminId: adminUser.id };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          console.error("Admin login error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "เกิดข้อผิดพลาดในการล็อคอิน กรุณาลองใหม่",
          });
        }
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
    listAdmin: publicProcedure.query(async () => {
      // Public endpoint for admin pages using AdminContext (username/password login)
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
    updateStatusAdmin: publicProcedure
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
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBooking(input.id);
        return { success: true };
      }),
  }),

  faqs: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await getFAQs(input?.category);
      }),
    all: adminProcedure.query(async () => {
      return await getAllFAQs();
    }),
    create: adminProcedure
      .input(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
          category: z.string().min(1),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createFAQ(input.question, input.answer, input.category, input.order);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          question: z.string().optional(),
          answer: z.string().optional(),
          category: z.string().optional(),
          order: z.number().optional(),
          isPublished: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateFAQ(input.id, input.question, input.answer, input.category, input.order, input.isPublished);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFAQ(input.id);
        return { success: true };
      }),
  }),

  documents: router({
    listAdmin: publicProcedure.query(async () => {
      return await getAllDocuments();
    }),
    uploadAdmin: publicProcedure
      .input(
        z.object({
          documentType: z.enum(["quotation", "invoice", "purchase-order", "work-order", "certificate", "contract"]),
          documentName: z.string().min(1, "ชื่อเอกสารจำเป็นต้องระบุ"),
          fileKey: z.string().min(1, "ไฟล์จำเป็นต้องระบุ"),
          fileUrl: z.string().min(1, "URL ไฟล์จำเป็นต้องระบุ"),
          fileName: z.string().min(1, "ชื่อไฟล์จำเป็นต้องระบุ"),
          fileSize: z.number().min(1, "ขนาดไฟล์จำเป็นต้องระบุ"),
          mimeType: z.string().min(1, "ประเภทไฟล์จำเป็นต้องระบุ"),
          description: z.string().optional(),
          uploadedBy: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await createDocument(input);
      }),
    deleteAdmin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDocument(input.id);
        return { success: true };
      }),
  }),

  // Document Generation Routers
  purchaseRequisitions: router({
    list: publicProcedure.query(async () => {
      return await getPurchaseRequisitions();
    }),
    create: publicProcedure
      .input(z.object({
        prNumber: z.string(),
        requestedBy: z.string(),
        itemDescription: z.string(),
        estimatedCost: z.string(),
        purpose: z.string(),
        status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createPurchaseRequisition(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updatePurchaseRequisition(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePurchaseRequisition(input.id);
        return { success: true };
      }),
  }),

  purchaseOrders: router({
    list: publicProcedure.query(async () => {
      return await getPurchaseOrders();
    }),
    create: publicProcedure
      .input(z.object({
        poNumber: z.string(),
        prId: z.coerce.number().optional(),
        supplierName: z.string(),
        supplierContact: z.string().optional(),
        itemDescription: z.string(),
        quantity: z.coerce.number(),
        unitPrice: z.string(),
        totalAmount: z.string(),
        deliveryDate: z.string().optional(),
        status: z.enum(["draft", "sent", "confirmed", "delivered", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createPurchaseOrder(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "confirmed", "delivered", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updatePurchaseOrder(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePurchaseOrder(input.id);
        return { success: true };
      }),
  }),

  stockRequisitions: router({
    list: publicProcedure.query(async () => {
      return await getStockRequisitions();
    }),
    create: publicProcedure
      .input(z.object({
        srNumber: z.string(),
        requestedBy: z.string(),
        projectName: z.string(),
        itemDescription: z.string(),
        quantity: z.coerce.number(),
        status: z.enum(["draft", "approved", "issued", "returned"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createStockRequisition(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "approved", "issued", "returned"]).optional(),
        approvedBy: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateStockRequisition(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteStockRequisition(input.id);
        return { success: true };
      }),
  }),

  jobOrders: router({
    list: publicProcedure.query(async () => {
      return await getJobOrders();
    }),
    create: publicProcedure
      .input(z.object({
        joNumber: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        serviceType: z.string(),
        workLocation: z.string(),
        problemDescription: z.string(),
        scheduledDate: z.string(),
        scheduledTime: z.string().optional(),
        estimatedDuration: z.string().optional(),
        assignedTo: z.string().optional(),
        status: z.enum(["draft", "scheduled", "in-progress", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createJobOrder(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "scheduled", "in-progress", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateJobOrder(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteJobOrder(input.id);
        return { success: true };
      }),
  }),

  fieldServiceReports: router({
    list: publicProcedure.query(async () => {
      return await getFieldServiceReports();
    }),
    create: publicProcedure
      .input(z.object({
        fsrNumber: z.string(),
        joId: z.coerce.number().optional(),
        technician: z.string(),
        workDate: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        pipeLength: z.string().optional(),
        wasteQuantity: z.string().optional(),
        beforePhotoUrl: z.string().optional(),
        afterPhotoUrl: z.string().optional(),
        workCompleted: z.boolean().optional(),
        issues: z.string().optional(),
        customerSignature: z.string().optional(),
        status: z.enum(["draft", "pending-approval", "approved", "rejected"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createFieldServiceReport(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "pending-approval", "approved", "rejected"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateFieldServiceReport(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFieldServiceReport(input.id);
        return { success: true };
      }),
  }),

  dailyLogs: router({
    list: publicProcedure.query(async () => {
      return await getDailyLogs();
    }),
    create: publicProcedure
      .input(z.object({
        dlNumber: z.string(),
        projectName: z.string(),
        logDate: z.string(),
        workersCount: z.coerce.number(),
        equipmentUsed: z.string().optional(),
        workDone: z.string().optional(),
        obstacles: z.string().optional(),
        weatherCondition: z.string().optional(),
        safetyIncidents: z.string().optional(),
        supervisor: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createDailyLog(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateDailyLog(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDailyLog(input.id);
        return { success: true };
      }),
  }),

  quotations: router({
    list: publicProcedure.query(async () => {
      return await getQuotations();
    }),
    create: publicProcedure
      .input(z.object({
        quoteNumber: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string().optional(),
        serviceType: z.string(),
        workLocation: z.string(),
        scopeOfWork: z.string(),
        laborCost: z.string(),
        materialCost: z.string().optional(),
        totalAmount: z.string(),
        validUntil: z.string().optional(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createQuotation(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateQuotation(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteQuotation(input.id);
        return { success: true };
      }),
  }),

  deliveryOrders: router({
    list: publicProcedure.query(async () => {
      return await getDeliveryOrders();
    }),
    create: publicProcedure
      .input(z.object({
        doNumber: z.string(),
        quoteId: z.coerce.number().optional(),
        customerName: z.string(),
        workDate: z.string(),
        workDescription: z.string(),
        workQuality: z.string().optional(),
        customerSignature: z.string().optional(),
        signedDate: z.string().optional(),
        status: z.enum(["draft", "pending-signature", "signed", "rejected"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createDeliveryOrder(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "pending-signature", "signed", "rejected"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateDeliveryOrder(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDeliveryOrder(input.id);
        return { success: true };
      }),
  }),

  invoices: router({
    list: publicProcedure.query(async () => {
      return await getInvoices();
    }),
    create: publicProcedure
      .input(z.object({
        invoiceNumber: z.string(),
        doId: z.coerce.number().optional(),
        customerName: z.string(),
        customerTaxId: z.string().optional(),
        customerAddress: z.string().optional(),
        invoiceDate: z.string(),
        dueDate: z.string().optional(),
        laborCost: z.string(),
        materialCost: z.string().optional(),
        taxRate: z.string().optional(),
        taxAmount: z.string(),
        totalAmount: z.string(),
        paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
        paymentMethod: z.string().optional(),
        paidAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createInvoice(input as any);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
        paidAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateInvoice(input.id, input);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteInvoice(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
