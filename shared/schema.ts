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
  blog_url: z.string().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  twitter_url: z.string().optional().nullable(),
  facebook_url: z.string().optional().nullable(),
  primary_phone: z.object({
    number: z.string(),
    source: z.string(),
    sanitized_number: z.string(),
  }).optional().nullable(),
  phone: z.string().optional(),
  founded_year: z.number().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  primary_domain: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  raw_address: z.string().optional(),
  industry: z.string().optional(),
  industries: z.array(z.string()).optional(),
  secondary_industries: z.array(z.string()).optional(),
  estimated_num_employees: z.number().optional(),
  keywords: z.array(z.string()).optional(),
  technology_names: z.array(z.string()).optional(),
  current_technologies: z.array(z.object({
    uid: z.string(),
    name: z.string(),
    category: z.string(),
  })).optional(),
  annual_revenue: z.number().optional(),
  short_description: z.string().optional(),
  total_funding: z.number().optional().nullable(),
  total_funding_printed: z.string().optional().nullable(),
  latest_funding_round_date: z.string().optional().nullable(),
  latest_funding_stage: z.string().optional().nullable(),
  departmental_head_count: z.record(z.number()).optional(),
  alexa_ranking: z.number().optional().nullable(),
  retail_location_count: z.number().optional(),
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
