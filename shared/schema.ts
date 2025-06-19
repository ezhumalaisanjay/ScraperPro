import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Apollo API response schemas
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  website_url: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  estimated_num_employees: z.number().optional(),
  keywords: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  annual_revenue: z.number().optional(),
  description: z.string().optional(),
});

export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  organization_id: z.string(),
  linkedin_url: z.string().optional(),
});

export const enrichmentRequestSchema = z.object({
  domains: z.array(z.string()).min(1, "At least one domain is required"),
  searchType: z.enum(["single", "bulk"]),
});

export type Organization = z.infer<typeof organizationSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type EnrichmentRequest = z.infer<typeof enrichmentRequestSchema>;
