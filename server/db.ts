import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, inquiries, InsertInquiry, portfolio, InsertPortfolio, reviews, InsertReview, bookings, InsertBooking, Booking } from "../drizzle/schema";
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
