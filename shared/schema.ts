import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  companyName: text("company_name").notNull(),
  companyGST: text("company_gst"),
  companyAddress: text("company_address"),
  logoUrl: text("logo_url"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientGST: text("client_gst"),
  clientAddress: text("client_address"),
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date").notNull(),
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(), // stored in cents
  sgstPercent: integer("sgst_percent").notNull().default(9),
  cgstPercent: integer("cgst_percent").notNull().default(9),
  sgstAmount: integer("sgst_amount").notNull().default(0),
  cgstAmount: integer("cgst_amount").notNull().default(0),
  total: integer("total").notNull(),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  theme: text("theme").notNull().default("classic"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  branchName: text("branch_name"),
  upiId: text("upi_id"),
  qrCodeUrl: text("qr_code_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Frontend-specific types
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  companyName: z.string().min(1, "Company name is required"),
  companyGST: z.string().optional(),
  companyAddress: z.string().optional(),
  logoUrl: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientGST: z.string().optional(),
  clientAddress: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  sgstPercent: z.number().min(0).max(100).default(9),
  cgstPercent: z.number().min(0).max(100).default(9),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  theme: z.enum(["classic", "modern", "bold"]).default("classic"),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  upiId: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
