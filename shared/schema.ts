import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: text("host_id").notNull(),
  
  // Intention
  intentionText: text("intention_text").notNull(),
  intentionCapturedAt: timestamp("intention_captured_at").notNull().defaultNow(),
  
  // Contact
  guestEmail: text("guest_email"),
  hostEmail: text("host_email"),
  
  // Context
  createdAt: timestamp("created_at").notNull().defaultNow(),
  locationLat: doublePrecision("location_lat"),
  locationLng: doublePrecision("location_lng"),
  
  // Vibe
  vibeDepth: integer("vibe_depth").notNull(),
  
  // Consent
  guestConsented: boolean("guest_consented").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  
  // Recording (audio stored as blob data URL for MVP)
  audioData: text("audio_data"), // Base64 encoded audio
  audioDurationSeconds: integer("audio_duration_seconds"),
  questionsAsked: text("questions_asked").array(),
  
  // Feedback
  npsScore: integer("nps_score"),
  feedbackText: text("feedback_text"),
  
  // AI Analysis
  transcript: text("transcript"),
  aiInsights: text("ai_insights"),
  posterPrompt: text("poster_prompt"),
  posterImageUrl: text("poster_image_url"),
  
  // Follow-up
  reminderSent: boolean("reminder_sent").notNull().default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
});

export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  intentionCapturedAt: true,
  reminderSent: true,
  reminderSentAt: true,
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
