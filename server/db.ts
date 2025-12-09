import { eq, like, or, desc, sql, and, gte, lte, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, formSubmissions, InsertFormSubmission, FormSubmission, cards, InsertCard, Card, adminCredentials, AdminCredential, wallet, Wallet, InsertWallet, commissionHistory, CommissionHistory, InsertCommissionHistory } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcrypt';

let _db: ReturnType<typeof drizzle> | null = null;

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

// ============================================
// Form Submissions Functions
// ============================================

export async function createFormSubmission(data: InsertFormSubmission): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(formSubmissions).values(data);
  return result[0].insertId;
}

export async function getFormSubmissionById(id: number): Promise<FormSubmission | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFormSubmission(id: number, data: Partial<InsertFormSubmission>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(formSubmissions).set(data).where(eq(formSubmissions.id, id));
}

export async function getAllFormSubmissions(params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ submissions: FormSubmission[]; total: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { search, limit = 50, offset = 0 } = params;

  let query = db.select().from(formSubmissions);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(formSubmissions);

  if (search && search.trim()) {
    const searchPattern = `%${search.trim()}%`;
    const searchCondition = or(
      like(formSubmissions.email, searchPattern),
      like(formSubmissions.cpf, searchPattern),
      like(formSubmissions.telefone, searchPattern),
      like(formSubmissions.nomePai, searchPattern),
      like(formSubmissions.nomeMae, searchPattern)
    );
    query = query.where(searchCondition) as typeof query;
    countQuery = countQuery.where(searchCondition) as typeof countQuery;
  }

  const [submissions, countResult] = await Promise.all([
    query.orderBy(desc(formSubmissions.submittedAt)).limit(limit).offset(offset),
    countQuery
  ]);

  return {
    submissions,
    total: countResult[0]?.count ?? 0
  };
}

export async function getFormSubmissionsForExport(): Promise<FormSubmission[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(formSubmissions).orderBy(desc(formSubmissions.submittedAt));
}

export async function deleteFormSubmission(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(formSubmissions).where(eq(formSubmissions.id, id));
}

export async function updateFormSubmissionData(id: number, data: Partial<InsertFormSubmission>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(formSubmissions).set(data).where(eq(formSubmissions.id, id));
}

// ============================================
// Cards Functions
// ============================================

export async function createCard(data: InsertCard): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(cards).values(data);
  return result[0].insertId;
}

export async function getCardById(id: number): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCards(params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ cards: Card[]; total: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { search, limit = 50, offset = 0 } = params;

  let query = db.select().from(cards);
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(cards);

  if (search && search.trim()) {
    const searchPattern = `%${search.trim()}%`;
    const searchCondition = or(
      like(cards.holderName, searchPattern),
      like(cards.email, searchPattern),
      like(cards.sentBy, searchPattern)
    );
    query = query.where(searchCondition) as typeof query;
    countQuery = countQuery.where(searchCondition) as typeof countQuery;
  }

  const [result, countResult] = await Promise.all([
    query.orderBy(desc(cards.createdDate)).limit(limit).offset(offset),
    countQuery
  ]);

  return {
    cards: result,
    total: countResult[0]?.count ?? 0
  };
}

export async function getWeeklyStats(): Promise<{
  totalCards: number;
  totalLimit: number;
  commissionBy30: number;
  commissionBy10: number;
  totalCommission: number;
  cardsByDay: Array<{ day: string; count: number; limit: number; commission: number }>;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyCards = await db
    .select()
    .from(cards)
    .where(gte(cards.createdDate, sevenDaysAgo));

  let totalCards = 0;
  let totalLimit = 0;
  let commissionBy30 = 0;
  let commissionBy10 = 0;

  const cardsByDay: Record<string, { count: number; limit: number; commission: number }> = {};

  weeklyCards.forEach(card => {
    totalCards++;
    totalLimit += card.limitReturned || 0;

    const commission = ((card.limitReturned || 0) * (card.commissionRate || 0)) / 100;
    
    if (card.commissionRate === 30) {
      commissionBy30 += commission;
    } else if (card.commissionRate === 10) {
      commissionBy10 += commission;
    }

    const day = card.createdDate ? new Date(card.createdDate).toLocaleDateString('pt-BR') : 'N/A';
    if (!cardsByDay[day]) {
      cardsByDay[day] = { count: 0, limit: 0, commission: 0 };
    }
    cardsByDay[day].count++;
    cardsByDay[day].limit += card.limitReturned || 0;
    cardsByDay[day].commission += commission;
  });

  return {
    totalCards,
    totalLimit,
    commissionBy30,
    commissionBy10,
    totalCommission: commissionBy30 + commissionBy10,
    cardsByDay: Object.entries(cardsByDay).map(([day, data]) => ({
      day,
      ...data
    }))
  };
}

export async function getCommissionStats(): Promise<{
  commission30Count: number;
  commission30Total: number;
  commission10Count: number;
  commission10Total: number;
  byCategory: Array<{ category: string; count: number; totalLimit: number; totalCommission: number }>;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allCards = await db.select().from(cards);

  let commission30Count = 0;
  let commission30Total = 0;
  let commission10Count = 0;
  let commission10Total = 0;

  const byCategory: Record<string, { count: number; totalLimit: number; totalCommission: number }> = {};

  allCards.forEach(card => {
    const commission = ((card.limitReturned || 0) * (card.commissionRate || 0)) / 100;
    const category = card.category || 'Sem Categoria';

    if (card.commissionRate === 30) {
      commission30Count++;
      commission30Total += commission;
    } else if (card.commissionRate === 10) {
      commission10Count++;
      commission10Total += commission;
    }

    if (!byCategory[category]) {
      byCategory[category] = { count: 0, totalLimit: 0, totalCommission: 0 };
    }
    byCategory[category].count++;
    byCategory[category].totalLimit += card.limitReturned || 0;
    byCategory[category].totalCommission += commission;
  });

  return {
    commission30Count,
    commission30Total,
    commission10Count,
    commission10Total,
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      ...data
    }))
  };
}


export async function updateCard(id: number, data: Partial<Card>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  // Adicionar apenas os campos que foram fornecidos
  const allowedFields = [
    'holderName', 'sentBy', 'limitReturned', 'commissionRate', 
    'status', 'email', 'password', 'fatherName', 'motherName',
    'category', 'rua', 'numero', 'complemento', 'bairro', 'cidade',
    'estado', 'cep', 'documentSentDate', 'limitReturnedDate'
  ] as const;

  allowedFields.forEach(field => {
    if (field in data && data[field as keyof Card] !== undefined) {
      updateData[field] = data[field as keyof Card];
    }
  });

  await db.update(cards).set(updateData).where(eq(cards.id, id));
}

export async function deleteCard(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(cards).where(eq(cards.id, id));
}


// ============ Admin Authentication Functions ============

export async function createAdminCredential(username: string, password: string): Promise<AdminCredential> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await db.insert(adminCredentials).values({
    username,
    passwordHash,
  });

  const created = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username));
  return created[0];
}

export async function verifyAdminCredentials(username: string, password: string): Promise<AdminCredential | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const admin = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username));
  
  if (!admin || admin.length === 0) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, admin[0].passwordHash);
  
  if (!isPasswordValid) {
    return null;
  }

  return admin[0];
}

export async function getAdminByUsername(username: string): Promise<AdminCredential | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const admin = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username));
  return admin.length > 0 ? admin[0] : null;
}


// Wallet functions
export async function getOrCreateWallet(): Promise<Wallet> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existingWallet = await db.select().from(wallet).limit(1);
  if (existingWallet.length > 0) {
    return existingWallet[0];
  }

  // Create default wallet
  await db.insert(wallet).values({
    totalBalance: 0,
    totalCommissions: 0,
    withdrawnAmount: 0,
    pendingAmount: 0,
  });

  const newWallet = await db.select().from(wallet).limit(1);
  return newWallet[0];
}

export async function getWallet(): Promise<Wallet | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(wallet).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateWalletBalance(totalBalance: number, totalCommissions: number, withdrawnAmount: number, pendingAmount: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existingWallet = await db.select().from(wallet).limit(1);
  if (existingWallet.length === 0) {
    await db.insert(wallet).values({
      totalBalance,
      totalCommissions,
      withdrawnAmount,
      pendingAmount,
    });
  } else {
    await db.update(wallet).set({
      totalBalance,
      totalCommissions,
      withdrawnAmount,
      pendingAmount,
    }).where(eq(wallet.id, existingWallet[0].id));
  }
}

// Commission History functions
export async function createCommissionRecord(record: InsertCommissionHistory): Promise<CommissionHistory> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(commissionHistory).values(record);
  const insertedId = result[0].insertId as number;

  const inserted = await db.select().from(commissionHistory).where(eq(commissionHistory.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getCommissionHistory(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(commissionHistory)
    .orderBy(desc(commissionHistory.createdAt))
    .limit(limit)
    .offset(offset);
}


export async function updateCommissionStatus(id: number, status: 'pending' | 'approved' | 'withdrawn' | 'cancelled'): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(commissionHistory).set({ status }).where(eq(commissionHistory.id, id));
}
