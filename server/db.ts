import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcrypt";
import { InsertUser, users, inquiries, InsertInquiry, portfolio, InsertPortfolio, reviews, InsertReview, bookings, InsertBooking, Booking, adminUsers, AdminUser, InsertAdminUser, faqs, FAQ, InsertFAQ, documents, Document, InsertDocument, purchaseRequisitions, PurchaseRequisition, InsertPurchaseRequisition, purchaseOrders, PurchaseOrder, InsertPurchaseOrder, stockRequisitions, StockRequisition, InsertStockRequisition, jobOrders, JobOrder, InsertJobOrder, fieldServiceReports, FieldServiceReport, InsertFieldServiceReport, dailyLogs, DailyLog, InsertDailyLog, quotations, Quotation, InsertQuotation, deliveryOrders, DeliveryOrder, InsertDeliveryOrder, invoices, Invoice, InsertInvoice } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createInquiry(inquiry: InsertInquiry) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create inquiry: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(inquiries).values(inquiry);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create inquiry:", error);
    throw error;
  }
}

export async function getInquiries(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inquiries: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get inquiries:", error);
    return [];
  }
}

export async function updateInquiryStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update inquiry: database not available");
    throw new Error("Database not available");
  }

  try {
    await db
      .update(inquiries)
      .set({ status: status as any })
      .where(eq(inquiries.id, id));
  } catch (error) {
    console.error("[Database] Failed to update inquiry:", error);
    throw error;
  }
}

export async function getPublishedPortfolio(limit = 12, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get portfolio: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.isPublished, "yes"))
      .orderBy(desc(portfolio.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get portfolio:", error);
    return [];
  }
}

export async function getPortfolioById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get portfolio item: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get portfolio item:", error);
    return undefined;
  }
}

export async function createPortfolioItem(item: InsertPortfolio) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create portfolio item: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(portfolio).values(item);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create portfolio item:", error);
    throw error;
  }
}


// Review functions
export async function createReview(review: InsertReview): Promise<void> {
  if (!review.customerName) {
    throw new Error("Customer name is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create review: database not available");
    return;
  }

  try {
    await db.insert(reviews).values(review);
  } catch (error) {
    console.error("[Database] Failed to create review:", error);
    throw error;
  }
}

export async function listPublishedReviews() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list reviews: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.isPublished, true))
      .orderBy(desc(reviews.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list reviews:", error);
    throw error;
  }
}

export async function listAllReviews() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list reviews: database not available");
    return [];
  }

  try {
    const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to list reviews:", error);
    throw error;
  }
}

export async function updateReviewStatus(id: number, isPublished: boolean): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update review: database not available");
    return;
  }

  try {
    await db.update(reviews).set({ isPublished }).where(eq(reviews.id, id));
  } catch (error) {
    console.error("[Database] Failed to update review:", error);
    throw error;
  }
}

export async function deleteReview(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete review: database not available");
    return;
  }

  try {
    await db.delete(reviews).where(eq(reviews.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete review:", error);
    throw error;
  }
}


export async function createBooking(booking: InsertBooking): Promise<Booking | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create booking: database not available");
    return null;
  }

  try {
    const result = await db.insert(bookings).values(booking);
    const insertedId = (result as any)[0];
    
    if (!insertedId) return null;

    const created = await db.select().from(bookings).where(eq(bookings.id, insertedId)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create booking:", error);
    throw error;
  }
}

export async function getBookings(filters?: { status?: string; serviceType?: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  try {
    let query: any = db.select().from(bookings);

    if (filters?.status) {
      query = query.where(eq(bookings.status, filters.status as any));
    }

    if (filters?.serviceType) {
      query = query.where(eq(bookings.serviceType, filters.serviceType));
    }

    const result = await query.orderBy(desc(bookings.bookingDate));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get bookings:", error);
    throw error;
  }
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get booking: database not available");
    return undefined;
  }

  try {
    const result: any = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get booking:", error);
    throw error;
  }
}

export async function updateBookingStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update booking: database not available");
    return null;
  }

  try {
    await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, id));
    return await getBookingById(id);
  } catch (error) {
    console.error("[Database] Failed to update booking:", error);
    throw error;
  }
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete booking: database not available");
    return false;
  }

  try {
    await db.delete(bookings).where(eq(bookings.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete booking:", error);
    throw error;
  }
}


// Admin Users
export async function createAdminUser(username: string, hashedPassword: string, email?: string, fullName?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create admin user: database not available");
    return null;
  }

  try {
    const result = await db.insert(adminUsers).values({
      username,
      password: hashedPassword,
      email: email || null,
      fullName: fullName || null,
      isActive: true,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create admin user:", error);
    throw error;
  }
}

export async function getAdminUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get admin user:", error);
    throw error;
  }
}

export async function updateAdminUserLastLogin(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update admin user: database not available");
    return;
  }

  try {
    await db.update(adminUsers).set({ lastLogin: new Date() }).where(eq(adminUsers.id, id));
  } catch (error) {
    console.error("[Database] Failed to update admin user last login:", error);
    throw error;
  }
}


// Password hashing and verification functions
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


// FAQs
export async function createFAQ(question: string, answer: string, category: string, order?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create FAQ: database not available");
    return null;
  }

  try {
    const result = await db.insert(faqs).values({
      question,
      answer,
      category,
      order: order || 0,
      isPublished: true,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create FAQ:", error);
    throw error;
  }
}

export async function getFAQs(category?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get FAQs: database not available");
    return [];
  }

  try {
    let query: any = db.select().from(faqs).where(eq(faqs.isPublished, true));
    if (category) {
      query = query.where(eq(faqs.category, category));
    }
    const result = await query.orderBy(faqs.order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get FAQs:", error);
    throw error;
  }
}

export async function getAllFAQs() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get FAQs: database not available");
    return [];
  }

  try {
    const result = await db.select().from(faqs).orderBy(faqs.order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all FAQs:", error);
    throw error;
  }
}

export async function updateFAQ(id: number, question?: string, answer?: string, category?: string, order?: number, isPublished?: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update FAQ: database not available");
    return null;
  }

  try {
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    await db.update(faqs).set(updateData).where(eq(faqs.id, id));
    return await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  } catch (error) {
    console.error("[Database] Failed to update FAQ:", error);
    throw error;
  }
}

export async function deleteFAQ(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete FAQ: database not available");
    return false;
  }

  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete FAQ:", error);
    throw error;
  }
}


// Documents
export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create document: database not available");
    return null;
  }

  try {
    const result = await db.insert(documents).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create document:", error);
    throw error;
  }
}

export async function getAllDocuments() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get documents: database not available");
    return [];
  }

  try {
    const result = await db.select().from(documents).orderBy(desc(documents.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get documents:", error);
    throw error;
  }
}

export async function getDocumentsByType(documentType: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get documents: database not available");
    return [];
  }

  try {
    const result = await db.select().from(documents).where(eq(documents.documentType, documentType as any)).orderBy(desc(documents.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get documents by type:", error);
    throw error;
  }
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get document: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get document:", error);
    throw error;
  }
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update document: database not available");
    return null;
  }

  try {
    await db.update(documents).set(data).where(eq(documents.id, id));
    return await getDocumentById(id);
  } catch (error) {
    console.error("[Database] Failed to update document:", error);
    throw error;
  }
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete document: database not available");
    return false;
  }

  try {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete document:", error);
    throw error;
  }
}


export async function deleteInquiry(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete inquiry: database not available");
    return false;
  }
  try {
    await db.delete(inquiries).where(eq(inquiries.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete inquiry:", error);
    throw error;
  }
}

export async function deletePortfolio(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete portfolio: database not available");
    return false;
  }
  try {
    await db.delete(portfolio).where(eq(portfolio.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete portfolio:", error);
    throw error;
  }
}


// ============================================
// Purchase Requisition Helpers
// ============================================
export async function createPurchaseRequisition(data: InsertPurchaseRequisition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchaseRequisitions).values(data);
  return result;
}

export async function getPurchaseRequisitions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(purchaseRequisitions).orderBy(desc(purchaseRequisitions.createdAt));
}

export async function getPurchaseRequisitionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.id, id));
  return result[0] || null;
}

export async function updatePurchaseRequisition(id: number, data: Partial<PurchaseRequisition>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseRequisitions).set(data).where(eq(purchaseRequisitions.id, id));
}

export async function deletePurchaseRequisition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(purchaseRequisitions).where(eq(purchaseRequisitions.id, id));
}

// ============================================
// Purchase Order Helpers
// ============================================
export async function createPurchaseOrder(data: InsertPurchaseOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(purchaseOrders).values(data);
}

export async function getPurchaseOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
  return result[0] || null;
}

export async function updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id));
}

export async function deletePurchaseOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
}

// ============================================
// Stock Requisition Helpers
// ============================================
export async function createStockRequisition(data: InsertStockRequisition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(stockRequisitions).values(data);
}

export async function getStockRequisitions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockRequisitions).orderBy(desc(stockRequisitions.createdAt));
}

export async function updateStockRequisition(id: number, data: Partial<StockRequisition>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(stockRequisitions).set(data).where(eq(stockRequisitions.id, id));
}

export async function deleteStockRequisition(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(stockRequisitions).where(eq(stockRequisitions.id, id));
}

// ============================================
// Job Order Helpers
// ============================================
export async function createJobOrder(data: InsertJobOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(jobOrders).values(data);
}

export async function getJobOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobOrders).orderBy(desc(jobOrders.createdAt));
}

export async function getJobOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobOrders).where(eq(jobOrders.id, id));
  return result[0] || null;
}

export async function updateJobOrder(id: number, data: Partial<JobOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobOrders).set(data).where(eq(jobOrders.id, id));
}

export async function deleteJobOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobOrders).where(eq(jobOrders.id, id));
}

// ============================================
// Field Service Report Helpers
// ============================================
export async function createFieldServiceReport(data: InsertFieldServiceReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(fieldServiceReports).values(data);
}

export async function getFieldServiceReports() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(fieldServiceReports).orderBy(desc(fieldServiceReports.createdAt));
}

export async function updateFieldServiceReport(id: number, data: Partial<FieldServiceReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fieldServiceReports).set(data).where(eq(fieldServiceReports.id, id));
}

export async function deleteFieldServiceReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(fieldServiceReports).where(eq(fieldServiceReports.id, id));
}

// ============================================
// Daily Log Helpers
// ============================================
export async function createDailyLog(data: InsertDailyLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(dailyLogs).values(data);
}

export async function getDailyLogs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dailyLogs).orderBy(desc(dailyLogs.createdAt));
}

export async function updateDailyLog(id: number, data: Partial<DailyLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(dailyLogs).set(data).where(eq(dailyLogs.id, id));
}

export async function deleteDailyLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(dailyLogs).where(eq(dailyLogs.id, id));
}

// ============================================
// Quotation Helpers
// ============================================
export async function createQuotation(data: InsertQuotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(quotations).values(data);
}

export async function getQuotations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
}

export async function getQuotationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quotations).where(eq(quotations.id, id));
  return result[0] || null;
}

export async function updateQuotation(id: number, data: Partial<Quotation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotations).set(data).where(eq(quotations.id, id));
}

export async function deleteQuotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quotations).where(eq(quotations.id, id));
}

// ============================================
// Delivery Order Helpers
// ============================================
export async function createDeliveryOrder(data: InsertDeliveryOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(deliveryOrders).values(data);
}

export async function getDeliveryOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(deliveryOrders).orderBy(desc(deliveryOrders.createdAt));
}

export async function updateDeliveryOrder(id: number, data: Partial<DeliveryOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deliveryOrders).set(data).where(eq(deliveryOrders.id, id));
}

export async function deleteDeliveryOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(deliveryOrders).where(eq(deliveryOrders.id, id));
}

// ============================================
// Invoice Helpers
// ============================================
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(invoices).values(data);
}

export async function getInvoices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(invoices).where(eq(invoices.id, id));
  return result[0] || null;
}

export async function updateInvoice(id: number, data: Partial<Invoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoices).where(eq(invoices.id, id));
}
