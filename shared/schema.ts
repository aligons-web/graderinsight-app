import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Proficiency Level Schema
export const proficiencyLevelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Level name is required"),
  score: z.number().min(0, "Score must be positive"),
  description: z.string(),
});

export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>;

// Criterion Schema
export const criterionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Criterion name is required"),
  weight: z.number().min(1, "Weight must be at least 1").max(100, "Weight cannot exceed 100"),
  levels: z.array(proficiencyLevelSchema).min(1, "At least one proficiency level is required"),
});

export type Criterion = z.infer<typeof criterionSchema>;

// Rubric Schema
export const rubricSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Rubric name is required"),
  description: z.string().optional(),
  criteria: z.array(criterionSchema),
  totalPoints: z.number(),
  isTemplate: z.boolean().default(false),
});

export type Rubric = z.infer<typeof rubricSchema>;

// Insert schemas for creating new rubrics
export const insertRubricSchema = rubricSchema.omit({ id: true });
export type InsertRubric = z.infer<typeof insertRubricSchema>;

export const insertCriterionSchema = criterionSchema.omit({ id: true });
export type InsertCriterion = z.infer<typeof insertCriterionSchema>;
