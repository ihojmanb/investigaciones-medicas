import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const expenseSubmissions = pgTable("expense_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Mandatory fields
  patient: text("patient").notNull(),
  study: text("study").notNull(),
  visit: text("visit").notNull(),
  visitDate: date("visit_date").notNull(),
  
  // Optional transport
  transportReceipt: text("transport_receipt"),
  transportAmount: decimal("transport_amount"),
  
  // Optional trips (Pasajes 1-4)
  trip1Receipt: text("trip1_receipt"),
  trip1Amount: decimal("trip1_amount"),
  trip2Receipt: text("trip2_receipt"),
  trip2Amount: decimal("trip2_amount"),
  trip3Receipt: text("trip3_receipt"),
  trip3Amount: decimal("trip3_amount"),
  trip4Receipt: text("trip4_receipt"),
  trip4Amount: decimal("trip4_amount"),
  
  // Optional food
  foodReceipt: text("food_receipt"),
  foodAmount: decimal("food_amount"),
  
  // Optional accommodation
  accommodationReceipt: text("accommodation_receipt"),
  accommodationAmount: decimal("accommodation_amount"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExpenseSubmissionSchema = createInsertSchema(expenseSubmissions).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ExpenseSubmission = typeof expenseSubmissions.$inferSelect;
export type InsertExpenseSubmission = z.infer<typeof insertExpenseSubmissionSchema>;
