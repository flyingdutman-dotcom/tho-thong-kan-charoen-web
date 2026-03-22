import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  rating: int("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  serviceType: varchar("serviceType", { length: 255 }), // e.g., "ลอกท่อระบายน้ำ"
  projectLocation: varchar("projectLocation", { length: 255 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  bookingDate: timestamp("bookingDate").notNull(),
  timeSlot: varchar("timeSlot", { length: 50 }).notNull(), // e.g., "09:00-10:00"
  location: text("location"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Stores customer contact form submissions.
 * Tracks service inquiries and quotation requests.
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  message: text("message"),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["new", "contacted", "completed", "rejected"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Portfolio table for storing project showcases with before/after images.
 * Tracks completed projects and their details.
 */
export const portfolio = mysqlTable("portfolio", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  beforeImage: varchar("beforeImage", { length: 500 }),
  afterImage: varchar("afterImage", { length: 500 }),
  location: varchar("location", { length: 255 }),
  completedDate: timestamp("completedDate"),
  isPublished: mysqlEnum("isPublished", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = typeof portfolio.$inferInsert;

/**
 * Admin users table for username/password authentication.
 * Separate from OAuth users for admin-only access.
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 320 }),
  fullName: text("fullName"),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;


/**
 * FAQ table for storing frequently asked questions and answers.
 * Helps reduce customer support inquiries.
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "บริการ", "ราคา", "การจอง", "อื่นๆ"
  order: int("order").default(0).notNull(), // For sorting
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;


/**
 * Documents table for storing company documents.
 * Supports quotations, invoices, purchase orders, work orders, certificates, and contracts.
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  documentType: mysqlEnum("documentType", ["quotation", "invoice", "purchase-order", "work-order", "certificate", "contract"]).notNull(),
  documentName: varchar("documentName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key for file storage
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(), // CDN URL for file access
  fileName: varchar("fileName", { length: 255 }).notNull(), // Original file name
  fileSize: int("fileSize").notNull(), // File size in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(), // e.g., "application/pdf"
  description: text("description"), // Optional description
  uploadedBy: int("uploadedBy").notNull(), // Admin user ID who uploaded
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;


/**
 * Purchase Requisition (PR) - ใบขอซื้อ
 * Used internally for requesting equipment/materials approval
 */
export const purchaseRequisitions = mysqlTable("purchase_requisitions", {
  id: int("id").autoincrement().primaryKey(),
  prNumber: varchar("prNumber", { length: 50 }).notNull().unique(), // e.g., "PR-2026-001"
  requestedBy: varchar("requestedBy", { length: 255 }).notNull(), // Department/person requesting
  itemDescription: text("itemDescription").notNull(), // Description of items to purchase
  estimatedCost: decimal("estimatedCost", { precision: 12, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(), // Why it's needed (e.g., project name)
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected"]).default("draft").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }), // Name of approver
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseRequisition = typeof purchaseRequisitions.$inferSelect;
export type InsertPurchaseRequisition = typeof purchaseRequisitions.$inferInsert;

/**
 * Purchase Order (PO) - ใบสั่งซื้อ
 * Sent to supplier after PR approval
 */
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  poNumber: varchar("poNumber", { length: 50 }).notNull().unique(), // e.g., "PO-2026-001"
  prId: int("prId"), // Reference to PR if applicable
  supplierName: varchar("supplierName", { length: 255 }).notNull(),
  supplierContact: varchar("supplierContact", { length: 255 }),
  itemDescription: text("itemDescription").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  deliveryDate: date("deliveryDate"),
  status: mysqlEnum("status", ["draft", "sent", "confirmed", "delivered", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Stock Requisition - ใบเบิกอุปกรณ์
 * For tracking equipment/materials taken from inventory
 */
export const stockRequisitions = mysqlTable("stock_requisitions", {
  id: int("id").autoincrement().primaryKey(),
  srNumber: varchar("srNumber", { length: 50 }).notNull().unique(), // e.g., "SR-2026-001"
  requestedBy: varchar("requestedBy", { length: 255 }).notNull(), // Team/person requesting
  projectName: varchar("projectName", { length: 255 }).notNull(),
  itemDescription: text("itemDescription").notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "issued", "returned"]).default("draft").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }),
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockRequisition = typeof stockRequisitions.$inferSelect;
export type InsertStockRequisition = typeof stockRequisitions.$inferInsert;

/**
 * Job Order / Work Order - ใบสั่งงาน
 * Details of work to be done at a specific location
 */
export const jobOrders = mysqlTable("job_orders", {
  id: int("id").autoincrement().primaryKey(),
  joNumber: varchar("joNumber", { length: 50 }).notNull().unique(), // e.g., "JO-2026-001"
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  serviceType: varchar("serviceType", { length: 100 }).notNull(), // e.g., "ลอกท่อระบายน้ำ"
  workLocation: text("workLocation").notNull(),
  problemDescription: text("problemDescription").notNull(), // e.g., "ท่อตันจากไขมัน"
  scheduledDate: date("scheduledDate").notNull(),
  scheduledTime: varchar("scheduledTime", { length: 10 }), // e.g., "09:00"
  estimatedDuration: varchar("estimatedDuration", { length: 50 }), // e.g., "2 hours"
  assignedTo: varchar("assignedTo", { length: 255 }), // Technician name
  status: mysqlEnum("status", ["draft", "scheduled", "in-progress", "completed", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobOrder = typeof jobOrders.$inferSelect;
export type InsertJobOrder = typeof jobOrders.$inferInsert;

/**
 * Field Service Report - ใบรายงานหน้างาน
 * Completed after work is done, includes photos and measurements
 */
export const fieldServiceReports = mysqlTable("field_service_reports", {
  id: int("id").autoincrement().primaryKey(),
  fsrNumber: varchar("fsrNumber", { length: 50 }).notNull().unique(), // e.g., "FSR-2026-001"
  joId: int("joId"), // Reference to Job Order
  technician: varchar("technician", { length: 255 }).notNull(),
  workDate: date("workDate").notNull(),
  startTime: varchar("startTime", { length: 10 }),
  endTime: varchar("endTime", { length: 10 }),
  pipeLength: decimal("pipeLength", { precision: 8, scale: 2 }), // Length in meters
  wasteQuantity: varchar("wasteQuantity", { length: 255 }), // e.g., "5 bags"
  beforePhotoUrl: varchar("beforePhotoUrl", { length: 500 }),
  afterPhotoUrl: varchar("afterPhotoUrl", { length: 500 }),
  workCompleted: boolean("workCompleted").default(false).notNull(),
  issues: text("issues"), // Any issues encountered
  customerSignature: varchar("customerSignature", { length: 500 }), // URL to signature image
  status: mysqlEnum("status", ["draft", "pending-approval", "approved", "rejected"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FieldServiceReport = typeof fieldServiceReports.$inferSelect;
export type InsertFieldServiceReport = typeof fieldServiceReports.$inferInsert;

/**
 * Daily Log - บันทึกประจำวัน
 * For long-term projects, track daily progress
 */
export const dailyLogs = mysqlTable("daily_logs", {
  id: int("id").autoincrement().primaryKey(),
  dlNumber: varchar("dlNumber", { length: 50 }).notNull().unique(), // e.g., "DL-2026-001"
  projectName: varchar("projectName", { length: 255 }).notNull(),
  logDate: date("logDate").notNull(),
  workersCount: int("workersCount").notNull(), // Number of workers
  equipmentUsed: text("equipmentUsed"), // List of equipment
  workDone: text("workDone"), // Description of work done
  obstacles: text("obstacles"), // Any obstacles encountered
  weatherCondition: varchar("weatherCondition", { length: 100 }), // e.g., "Sunny", "Rainy"
  safetyIncidents: text("safetyIncidents"), // Any safety issues
  supervisor: varchar("supervisor", { length: 255 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

/**
 * Quotation - ใบเสนอราคา
 * Proposal sent to customer with scope and pricing
 */
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  quoteNumber: varchar("quoteNumber", { length: 50 }).notNull().unique(), // e.g., "QT-2026-001"
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  workLocation: text("workLocation").notNull(),
  scopeOfWork: text("scopeOfWork").notNull(), // Detailed description of work
  laborCost: decimal("laborCost", { precision: 12, scale: 2 }).notNull(),
  materialCost: decimal("materialCost", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  validUntil: date("validUntil"),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Delivery Order / Service Acceptance - ใบรับมอบงาน
 * Customer signs to confirm work completion and satisfaction
 */
export const deliveryOrders = mysqlTable("delivery_orders", {
  id: int("id").autoincrement().primaryKey(),
  doNumber: varchar("doNumber", { length: 50 }).notNull().unique(), // e.g., "DO-2026-001"
  quoteId: int("quoteId"), // Reference to Quotation
  customerName: varchar("customerName", { length: 255 }).notNull(),
  workDate: date("workDate").notNull(),
  workDescription: text("workDescription").notNull(),
  workQuality: varchar("workQuality", { length: 100 }), // e.g., "Excellent", "Good", "Satisfactory"
  customerSignature: varchar("customerSignature", { length: 500 }), // URL to signature image
  signedDate: date("signedDate"),
  status: mysqlEnum("status", ["draft", "pending-signature", "signed", "rejected"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type InsertDeliveryOrder = typeof deliveryOrders.$inferInsert;

/**
 * Invoice / Tax Invoice - ใบแจ้งหนี้
 * Billing document sent after work completion
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(), // e.g., "INV-2026-001"
  doId: int("doId"), // Reference to Delivery Order
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerTaxId: varchar("customerTaxId", { length: 50 }),
  customerAddress: text("customerAddress"),
  invoiceDate: date("invoiceDate").notNull(),
  dueDate: date("dueDate"),
  laborCost: decimal("laborCost", { precision: 12, scale: 2 }).notNull(),
  materialCost: decimal("materialCost", { precision: 12, scale: 2 }).default("0").notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("7").notNull(), // VAT percentage
  taxAmount: decimal("taxAmount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "partial", "paid"]).default("unpaid").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }), // e.g., "Bank Transfer", "Cash"
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
