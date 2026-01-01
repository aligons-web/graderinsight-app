import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  jsonb, 
  timestamp, 
  boolean, 
  uuid,
  index,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// USERS TABLE (With Admin Role)
// ============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  name: text("name"),
  role: text("role").default("user"), // "user" or "admin"
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password_hash: true,
  name: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// SUBSCRIPTION PLANS TABLE
// ============================================

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tier: text("tier").notNull().unique(),
  stripe_price_id: text("stripe_price_id"),
  stripe_product_id: text("stripe_product_id"),
  price_cents: integer("price_cents").default(0),
  billing_period: text("billing_period"),
  features: jsonb("features").notNull().$type<{
    max_rubrics: number | null;
    custom_rubrics: boolean;
    template_access: boolean;
    assignment_uploads_limit: number | null;
    ai_grading: boolean;
    anonymizer: boolean;
    user_dashboard: boolean;
    bulk_export: boolean;
    advanced_rubrics: boolean;
    analytics_dashboard?: boolean;
    error_tracking?: boolean;
    academic_integrity?: boolean;
    user_management?: boolean;
    subscription_management?: boolean;
    system_settings?: boolean;
    analytics?: boolean;
    audit_logs?: boolean;
    template_management?: boolean;
  }>(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// ============================================
// USER SUBSCRIPTIONS TABLE
// ============================================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  plan_id: uuid("plan_id").references(() => subscriptionPlans.id),
  tier: text("tier").notNull(),
  status: text("status").notNull(),
  stripe_customer_id: text("stripe_customer_id"),
  stripe_subscription_id: text("stripe_subscription_id"),
  current_period_start: timestamp("current_period_start"),
  current_period_end: timestamp("current_period_end"),
  expires_at: timestamp("expires_at").notNull(),
  cancel_at_period_end: boolean("cancel_at_period_end").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.user_id),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  tierIdx: index("subscriptions_tier_idx").on(table.tier),
}));

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// ============================================
// ASSIGNMENT UPLOAD TRACKING TABLE
// ============================================

export const assignmentUploads = pgTable("assignment_uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  upload_count: integer("upload_count").default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userMonthIdx: index("assignment_uploads_user_month_idx").on(table.user_id, table.year, table.month),
  userMonthUnique: unique("assignment_uploads_user_month_unique").on(table.user_id, table.year, table.month),
}));

export const insertAssignmentUploadSchema = createInsertSchema(assignmentUploads);
export type AssignmentUpload = typeof assignmentUploads.$inferSelect;
export type InsertAssignmentUpload = z.infer<typeof insertAssignmentUploadSchema>;

// ============================================
// DESKTOP SESSIONS TABLE
// ============================================

export const desktopSessions = pgTable("desktop_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text("token").notNull().unique(),
  last_validated: timestamp("last_validated").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("desktop_sessions_user_id_idx").on(table.user_id),
  tokenIdx: index("desktop_sessions_token_idx").on(table.token),
}));

export type DesktopSession = typeof desktopSessions.$inferSelect;

// ============================================
// AUDIT LOGS TABLE
// ============================================

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
  action: text("action").notNull(),
  entity_type: text("entity_type"),
  entity_id: text("entity_id"),
  details: jsonb("details"),
  ip_address: text("ip_address"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.user_id),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.created_at),
}));

export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================
// RUBRICS TABLE
// ============================================

export const rubrics = pgTable("rubrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  rubric_summary: text("rubric_summary"),
  rubric_type: text("rubric_type").notNull(),
  academic_level: text("academic_level").notNull(),
  total_points: integer("total_points").default(100),
  minimum_word_count: integer("minimum_word_count"),
  time_limit_minutes: integer("time_limit_minutes"),
  late_policy_enabled: boolean("late_policy_enabled").default(true),
  revision_policy_enabled: boolean("revision_policy_enabled").default(true),
  is_template: boolean("is_template").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("rubrics_user_id_idx").on(table.user_id),
  typeIdx: index("rubrics_type_idx").on(table.rubric_type),
  academicLevelIdx: index("rubrics_academic_level_idx").on(table.academic_level),
  isTemplateIdx: index("rubrics_is_template_idx").on(table.is_template),
}));

export const insertRubricSchema = createInsertSchema(rubrics);
export type Rubric = typeof rubrics.$inferSelect;
export type InsertRubric = z.infer<typeof insertRubricSchema>;

// ============================================
// RUBRIC CRITERIA TABLE
// ============================================

export const rubricCriteria = pgTable("rubric_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id, { onDelete: 'cascade' }).notNull(),
  criterion_name: text("criterion_name").notNull(),
  criterion_description: text("criterion_description"),
  max_points: integer("max_points").notNull(),
  order_position: integer("order_position").notNull(),
  scoring_guide: jsonb("scoring_guide").notNull().$type<Array<{
    range: string;
    description: string;
  }>>(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  rubricIdIdx: index("rubric_criteria_rubric_id_idx").on(table.rubric_id),
}));

export const insertRubricCriterionSchema = createInsertSchema(rubricCriteria);
export type RubricCriterion = typeof rubricCriteria.$inferSelect;
export type InsertRubricCriterion = z.infer<typeof insertRubricCriterionSchema>;

// ============================================
// LATE POLICIES TABLE
// ============================================

export const latePolicies = pgTable("late_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id, { onDelete: 'cascade' }).notNull(),
  hours_late_min: integer("hours_late_min").notNull(),
  hours_late_max: integer("hours_late_max"),
  point_deduction: integer("point_deduction").notNull(),
  custom_rule: text("custom_rule"),
  order_position: integer("order_position").notNull(),
}, (table) => ({
  rubricIdIdx: index("late_policies_rubric_id_idx").on(table.rubric_id),
}));

export const insertLatePolicySchema = createInsertSchema(latePolicies);
export type LatePolicy = typeof latePolicies.$inferSelect;
export type InsertLatePolicy = z.infer<typeof insertLatePolicySchema>;

// ============================================
// REVISION POLICIES TABLE
// ============================================

export const revisionPolicies = pgTable("revision_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id, { onDelete: 'cascade' }).notNull(),
  revisions_allowed: integer("revisions_allowed").default(1),
  max_revision_score: integer("max_revision_score").notNull(),
  revision_deadline_days: integer("revision_deadline_days").notNull(),
  revision_conditions: text("revision_conditions"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  rubricIdIdx: index("revision_policies_rubric_id_idx").on(table.rubric_id),
}));

export const insertRevisionPolicySchema = createInsertSchema(revisionPolicies);
export type RevisionPolicy = typeof revisionPolicies.$inferSelect;
export type InsertRevisionPolicy = z.infer<typeof insertRevisionPolicySchema>;

// ============================================
// GRADING SESSIONS TABLE
// ============================================

export const gradingSessions = pgTable("grading_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id).notNull(),
  document_name: text("document_name"),
  document_url: text("document_url"),
  document_text: text("document_text"),
  ai_scores: jsonb("ai_scores").$type<Array<{
    criterion_id: string;
    score: number;
    feedback: string;
  }>>(),
  final_scores: jsonb("final_scores").$type<Array<{
    criterion_id: string;
    score: number;
    feedback: string;
  }>>(),
  total_score: integer("total_score"),
  feedback: text("feedback"),
  status: text("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("grading_sessions_user_id_idx").on(table.user_id),
  rubricIdIdx: index("grading_sessions_rubric_id_idx").on(table.rubric_id),
  statusIdx: index("grading_sessions_status_idx").on(table.status),
}));

export const insertGradingSessionSchema = createInsertSchema(gradingSessions);
export type GradingSession = typeof gradingSessions.$inferSelect;
export type InsertGradingSession = z.infer<typeof insertGradingSessionSchema>;

// ============================================
// ACADEMIC INTEGRITY CHECKS TABLE
// ============================================

export const academicIntegrityChecks = pgTable("academic_integrity_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  grading_session_id: uuid("grading_session_id").references(() => gradingSessions.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid("user_id").references(() => users.id).notNull(),

  plagiarism_detected: boolean("plagiarism_detected").default(false),
  plagiarism_score: integer("plagiarism_score"),
  plagiarism_sources: jsonb("plagiarism_sources").$type<Array<{
    source_url: string;
    match_percentage: number;
    matched_text: string;
  }>>(),

  ai_detected: boolean("ai_detected").default(false),
  ai_confidence_score: integer("ai_confidence_score"),
  ai_detection_details: jsonb("ai_detection_details").$type<{
    tool_used: string;
    flagged_sections: Array<{
      text: string;
      confidence: number;
    }>;
  }>(),

  citation_issues_found: boolean("citation_issues_found").default(false),
  citation_issue_count: integer("citation_issue_count").default(0),
  citation_issues: jsonb("citation_issues").$type<Array<{
    issue_type: string;
    location: string;
    description: string;
    severity: string;
  }>>(),

  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  gradingSessionIdx: index("academic_integrity_grading_session_idx").on(table.grading_session_id),
  userIdIdx: index("academic_integrity_user_id_idx").on(table.user_id),
  plagiarismIdx: index("academic_integrity_plagiarism_idx").on(table.plagiarism_detected),
  aiDetectedIdx: index("academic_integrity_ai_detected_idx").on(table.ai_detected),
}));

export const insertAcademicIntegrityCheckSchema = createInsertSchema(academicIntegrityChecks);
export type AcademicIntegrityCheck = typeof academicIntegrityChecks.$inferSelect;
export type InsertAcademicIntegrityCheck = z.infer<typeof insertAcademicIntegrityCheckSchema>;

// ============================================
// ERROR PATTERNS TABLE
// ============================================

export const errorPatterns = pgTable("error_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  grading_session_id: uuid("grading_session_id").references(() => gradingSessions.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id).notNull(),

  error_category: text("error_category").notNull(),
  error_type: text("error_type").notNull(),
  error_count: integer("error_count").default(1),
  affected_criterion: text("affected_criterion"),
  severity: text("severity"),

  error_details: jsonb("error_details").$type<{
    location: string;
    example_text: string;
    suggestion: string;
  }>(),

  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  gradingSessionIdx: index("error_patterns_grading_session_idx").on(table.grading_session_id),
  userIdIdx: index("error_patterns_user_id_idx").on(table.user_id),
  categoryIdx: index("error_patterns_category_idx").on(table.error_category),
  typeIdx: index("error_patterns_type_idx").on(table.error_type),
}));

export const insertErrorPatternSchema = createInsertSchema(errorPatterns);
export type ErrorPattern = typeof errorPatterns.$inferSelect;
export type InsertErrorPattern = z.infer<typeof insertErrorPatternSchema>;

// ============================================
// CRITERION PERFORMANCE TABLE
// ============================================

export const criterionPerformance = pgTable("criterion_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  grading_session_id: uuid("grading_session_id").references(() => gradingSessions.id, { onDelete: 'cascade' }).notNull(),
  rubric_id: uuid("rubric_id").references(() => rubrics.id).notNull(),
  criterion_id: uuid("criterion_id").references(() => rubricCriteria.id).notNull(),
  user_id: uuid("user_id").references(() => users.id).notNull(),

  score_received: integer("score_received").notNull(),
  max_score: integer("max_score").notNull(),
  percentage: integer("percentage").notNull(),

  common_strengths: jsonb("common_strengths").$type<Array<string>>(),
  common_weaknesses: jsonb("common_weaknesses").$type<Array<string>>(),

  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  rubricCriterionIdx: index("criterion_performance_rubric_criterion_idx").on(table.rubric_id, table.criterion_id),
  userIdIdx: index("criterion_performance_user_id_idx").on(table.user_id),
}));

export const insertCriterionPerformanceSchema = createInsertSchema(criterionPerformance);
export type CriterionPerformance = typeof criterionPerformance.$inferSelect;
export type InsertCriterionPerformance = z.infer<typeof insertCriterionPerformanceSchema>;

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  rubrics: many(rubrics),
  gradingSessions: many(gradingSessions),
  desktopSessions: many(desktopSessions),
  assignmentUploads: many(assignmentUploads),
  auditLogs: many(auditLogs),
  academicIntegrityChecks: many(academicIntegrityChecks),
  errorPatterns: many(errorPatterns),
  criterionPerformance: many(criterionPerformance),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.plan_id],
    references: [subscriptionPlans.id],
  }),
}));

export const rubricsRelations = relations(rubrics, ({ one, many }) => ({
  user: one(users, {
    fields: [rubrics.user_id],
    references: [users.id],
  }),
  criteria: many(rubricCriteria),
  latePolicies: many(latePolicies),
  revisionPolicies: many(revisionPolicies),
  gradingSessions: many(gradingSessions),
  errorPatterns: many(errorPatterns),
  criterionPerformance: many(criterionPerformance),
}));

export const rubricCriteriaRelations = relations(rubricCriteria, ({ one, many }) => ({
  rubric: one(rubrics, {
    fields: [rubricCriteria.rubric_id],
    references: [rubrics.id],
  }),
  criterionPerformance: many(criterionPerformance),
}));

export const latePoliciesRelations = relations(latePolicies, ({ one }) => ({
  rubric: one(rubrics, {
    fields: [latePolicies.rubric_id],
    references: [rubrics.id],
  }),
}));

export const revisionPoliciesRelations = relations(revisionPolicies, ({ one }) => ({
  rubric: one(rubrics, {
    fields: [revisionPolicies.rubric_id],
    references: [rubrics.id],
  }),
}));

export const gradingSessionsRelations = relations(gradingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gradingSessions.user_id],
    references: [users.id],
  }),
  rubric: one(rubrics, {
    fields: [gradingSessions.rubric_id],
    references: [rubrics.id],
  }),
  academicIntegrityCheck: one(academicIntegrityChecks, {
    fields: [gradingSessions.id],
    references: [academicIntegrityChecks.grading_session_id],
  }),
  errorPatterns: many(errorPatterns),
  criterionPerformance: many(criterionPerformance),
}));

export const assignmentUploadsRelations = relations(assignmentUploads, ({ one }) => ({
  user: one(users, {
    fields: [assignmentUploads.user_id],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}));

export const academicIntegrityChecksRelations = relations(academicIntegrityChecks, ({ one }) => ({
  gradingSession: one(gradingSessions, {
    fields: [academicIntegrityChecks.grading_session_id],
    references: [gradingSessions.id],
  }),
  user: one(users, {
    fields: [academicIntegrityChecks.user_id],
    references: [users.id],
  }),
}));

export const errorPatternsRelations = relations(errorPatterns, ({ one }) => ({
  gradingSession: one(gradingSessions, {
    fields: [errorPatterns.grading_session_id],
    references: [gradingSessions.id],
  }),
  user: one(users, {
    fields: [errorPatterns.user_id],
    references: [users.id],
  }),
  rubric: one(rubrics, {
    fields: [errorPatterns.rubric_id],
    references: [rubrics.id],
  }),
}));

export const criterionPerformanceRelations = relations(criterionPerformance, ({ one }) => ({
  gradingSession: one(gradingSessions, {
    fields: [criterionPerformance.grading_session_id],
    references: [gradingSessions.id],
  }),
  rubric: one(rubrics, {
    fields: [criterionPerformance.rubric_id],
    references: [rubrics.id],
  }),
  criterion: one(rubricCriteria, {
    fields: [criterionPerformance.criterion_id],
    references: [rubricCriteria.id],
  }),
  user: one(users, {
    fields: [criterionPerformance.user_id],
    references: [users.id],
  }),
}));

// ============================================
// LEGACY ZOD SCHEMAS (Keep for compatibility)
// ============================================

export const proficiencyLevelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Level name is required"),
  score: z.number().min(0, "Score must be positive"),
  description: z.string(),
});
export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>;

export const criterionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Criterion name is required"),
  weight: z.number().min(1, "Weight must be at least 1").max(100, "Weight cannot exceed 100"),
  levels: z.array(proficiencyLevelSchema).min(1, "At least one proficiency level is required"),
});
export type Criterion = z.infer<typeof criterionSchema>;

export const educationLevelSchema = z.enum([
  "middle_school",
  "high_school", 
  "tech_college",
  "four_year_college",
  "graduate"
]);
export type EducationLevel = z.infer<typeof educationLevelSchema>;

export const templateTypeSchema = z.enum(["essay", "presentation"]);
export type TemplateType = z.infer<typeof templateTypeSchema>;

export const latePolicySchema = z.object({
  enabled: z.boolean().default(false),
  description: z.string().optional(),
});

export const revisionPolicySchema = z.object({
  enabled: z.boolean().default(false),
  description: z.string().optional(),
});

export const rubricSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Rubric name is required"),
  description: z.string().optional(),
  criteria: z.array(criterionSchema),
  totalPoints: z.number(),
  isTemplate: z.boolean().default(false),
  educationLevel: educationLevelSchema.optional(),
  templateType: templateTypeSchema.optional(),
  latePolicy: latePolicySchema.optional(),
  revisionPolicy: revisionPolicySchema.optional(),
  minimumLength: z.string().optional(),
  timeLimit: z.string().optional(),
});