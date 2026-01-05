"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rubricSchema = exports.revisionPolicySchema = exports.latePolicySchema = exports.templateTypeSchema = exports.educationLevelSchema = exports.criterionSchema = exports.proficiencyLevelSchema = exports.criterionPerformanceRelations = exports.errorPatternsRelations = exports.academicIntegrityChecksRelations = exports.auditLogsRelations = exports.assignmentUploadsRelations = exports.gradingSessionsRelations = exports.revisionPoliciesRelations = exports.latePoliciesRelations = exports.rubricCriteriaRelations = exports.rubricsRelations = exports.subscriptionsRelations = exports.usersRelations = exports.insertCriterionPerformanceSchema = exports.criterionPerformance = exports.insertErrorPatternSchema = exports.errorPatterns = exports.insertAcademicIntegrityCheckSchema = exports.academicIntegrityChecks = exports.insertGradingSessionSchema = exports.gradingSessions = exports.insertRevisionPolicySchema = exports.revisionPolicies = exports.insertLatePolicySchema = exports.latePolicies = exports.insertRubricCriterionSchema = exports.rubricCriteria = exports.insertRubricSchema = exports.rubrics = exports.auditLogs = exports.desktopSessions = exports.insertAssignmentUploadSchema = exports.assignmentUploads = exports.insertSubscriptionSchema = exports.subscriptions = exports.insertSubscriptionPlanSchema = exports.subscriptionPlans = exports.insertUserSchema = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
var drizzle_orm_1 = require("drizzle-orm");
// ============================================
// USERS TABLE (With Admin Role)
// ============================================
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    username: (0, pg_core_1.text)("username").unique(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password_hash: (0, pg_core_1.text)("password_hash").notNull(),
    name: (0, pg_core_1.text)("name"),
    role: (0, pg_core_1.text)("role").default("user"), // "user" or "admin"
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, function (table) { return ({
    emailIdx: (0, pg_core_1.index)("users_email_idx").on(table.email),
    roleIdx: (0, pg_core_1.index)("users_role_idx").on(table.role),
}); });
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    email: true,
    password_hash: true,
    name: true,
    role: true,
});
// ============================================
// SUBSCRIPTION PLANS TABLE
// ============================================
exports.subscriptionPlans = (0, pg_core_1.pgTable)("subscription_plans", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    tier: (0, pg_core_1.text)("tier").notNull().unique(),
    stripe_price_id: (0, pg_core_1.text)("stripe_price_id"),
    stripe_product_id: (0, pg_core_1.text)("stripe_product_id"),
    price_cents: (0, pg_core_1.integer)("price_cents").default(0),
    billing_period: (0, pg_core_1.text)("billing_period"),
    features: (0, pg_core_1.jsonb)("features").notNull().$type(),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertSubscriptionPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptionPlans);
// ============================================
// USER SUBSCRIPTIONS TABLE
// ============================================
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    plan_id: (0, pg_core_1.uuid)("plan_id").references(function () { return exports.subscriptionPlans.id; }),
    tier: (0, pg_core_1.text)("tier").notNull(),
    status: (0, pg_core_1.text)("status").notNull(),
    stripe_customer_id: (0, pg_core_1.text)("stripe_customer_id"),
    stripe_subscription_id: (0, pg_core_1.text)("stripe_subscription_id"),
    current_period_start: (0, pg_core_1.timestamp)("current_period_start"),
    current_period_end: (0, pg_core_1.timestamp)("current_period_end"),
    expires_at: (0, pg_core_1.timestamp)("expires_at").notNull(),
    cancel_at_period_end: (0, pg_core_1.boolean)("cancel_at_period_end").default(false),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("subscriptions_user_id_idx").on(table.user_id),
    statusIdx: (0, pg_core_1.index)("subscriptions_status_idx").on(table.status),
    tierIdx: (0, pg_core_1.index)("subscriptions_tier_idx").on(table.tier),
}); });
exports.insertSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptions);
// ============================================
// ASSIGNMENT UPLOAD TRACKING TABLE
// ============================================
exports.assignmentUploads = (0, pg_core_1.pgTable)("assignment_uploads", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    year: (0, pg_core_1.integer)("year").notNull(),
    month: (0, pg_core_1.integer)("month").notNull(),
    upload_count: (0, pg_core_1.integer)("upload_count").default(0),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, function (table) { return ({
    userMonthIdx: (0, pg_core_1.index)("assignment_uploads_user_month_idx").on(table.user_id, table.year, table.month),
    userMonthUnique: (0, pg_core_1.unique)("assignment_uploads_user_month_unique").on(table.user_id, table.year, table.month),
}); });
exports.insertAssignmentUploadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.assignmentUploads);
// ============================================
// DESKTOP SESSIONS TABLE
// ============================================
exports.desktopSessions = (0, pg_core_1.pgTable)("desktop_sessions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    last_validated: (0, pg_core_1.timestamp)("last_validated").defaultNow(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("desktop_sessions_user_id_idx").on(table.user_id),
    tokenIdx: (0, pg_core_1.index)("desktop_sessions_token_idx").on(table.token),
}); });
// ============================================
// AUDIT LOGS TABLE
// ============================================
exports.auditLogs = (0, pg_core_1.pgTable)("audit_logs", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'set null' }),
    action: (0, pg_core_1.text)("action").notNull(),
    entity_type: (0, pg_core_1.text)("entity_type"),
    entity_id: (0, pg_core_1.text)("entity_id"),
    details: (0, pg_core_1.jsonb)("details"),
    ip_address: (0, pg_core_1.text)("ip_address"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("audit_logs_user_id_idx").on(table.user_id),
    actionIdx: (0, pg_core_1.index)("audit_logs_action_idx").on(table.action),
    createdAtIdx: (0, pg_core_1.index)("audit_logs_created_at_idx").on(table.created_at),
}); });
// ============================================
// RUBRICS TABLE
// ============================================
exports.rubrics = (0, pg_core_1.pgTable)("rubrics", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    rubric_summary: (0, pg_core_1.text)("rubric_summary"),
    rubric_type: (0, pg_core_1.text)("rubric_type").notNull(),
    academic_level: (0, pg_core_1.text)("academic_level").notNull(),
    total_points: (0, pg_core_1.integer)("total_points").default(100),
    minimum_word_count: (0, pg_core_1.integer)("minimum_word_count"),
    time_limit_minutes: (0, pg_core_1.integer)("time_limit_minutes"),
    late_policy_enabled: (0, pg_core_1.boolean)("late_policy_enabled").default(true),
    revision_policy_enabled: (0, pg_core_1.boolean)("revision_policy_enabled").default(true),
    is_template: (0, pg_core_1.boolean)("is_template").default(false),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("rubrics_user_id_idx").on(table.user_id),
    typeIdx: (0, pg_core_1.index)("rubrics_type_idx").on(table.rubric_type),
    academicLevelIdx: (0, pg_core_1.index)("rubrics_academic_level_idx").on(table.academic_level),
    isTemplateIdx: (0, pg_core_1.index)("rubrics_is_template_idx").on(table.is_template),
}); });
exports.insertRubricSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rubrics);
// ============================================
// RUBRIC CRITERIA TABLE
// ============================================
exports.rubricCriteria = (0, pg_core_1.pgTable)("rubric_criteria", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }, { onDelete: 'cascade' }).notNull(),
    criterion_name: (0, pg_core_1.text)("criterion_name").notNull(),
    criterion_description: (0, pg_core_1.text)("criterion_description"),
    max_points: (0, pg_core_1.integer)("max_points").notNull(),
    order_position: (0, pg_core_1.integer)("order_position").notNull(),
    scoring_guide: (0, pg_core_1.jsonb)("scoring_guide").notNull().$type(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    rubricIdIdx: (0, pg_core_1.index)("rubric_criteria_rubric_id_idx").on(table.rubric_id),
}); });
exports.insertRubricCriterionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rubricCriteria);
// ============================================
// LATE POLICIES TABLE
// ============================================
exports.latePolicies = (0, pg_core_1.pgTable)("late_policies", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }, { onDelete: 'cascade' }).notNull(),
    hours_late_min: (0, pg_core_1.integer)("hours_late_min").notNull(),
    hours_late_max: (0, pg_core_1.integer)("hours_late_max"),
    point_deduction: (0, pg_core_1.integer)("point_deduction").notNull(),
    custom_rule: (0, pg_core_1.text)("custom_rule"),
    order_position: (0, pg_core_1.integer)("order_position").notNull(),
}, function (table) { return ({
    rubricIdIdx: (0, pg_core_1.index)("late_policies_rubric_id_idx").on(table.rubric_id),
}); });
exports.insertLatePolicySchema = (0, drizzle_zod_1.createInsertSchema)(exports.latePolicies);
// ============================================
// REVISION POLICIES TABLE
// ============================================
exports.revisionPolicies = (0, pg_core_1.pgTable)("revision_policies", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }, { onDelete: 'cascade' }).notNull(),
    revisions_allowed: (0, pg_core_1.integer)("revisions_allowed").default(1),
    max_revision_score: (0, pg_core_1.integer)("max_revision_score").notNull(),
    revision_deadline_days: (0, pg_core_1.integer)("revision_deadline_days").notNull(),
    revision_conditions: (0, pg_core_1.text)("revision_conditions"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    rubricIdIdx: (0, pg_core_1.index)("revision_policies_rubric_id_idx").on(table.rubric_id),
}); });
exports.insertRevisionPolicySchema = (0, drizzle_zod_1.createInsertSchema)(exports.revisionPolicies);
// ============================================
// GRADING SESSIONS TABLE
// ============================================
exports.gradingSessions = (0, pg_core_1.pgTable)("grading_sessions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }, { onDelete: 'cascade' }).notNull(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }).notNull(),
    document_name: (0, pg_core_1.text)("document_name"),
    document_url: (0, pg_core_1.text)("document_url"),
    document_text: (0, pg_core_1.text)("document_text"),
    ai_scores: (0, pg_core_1.jsonb)("ai_scores").$type(),
    final_scores: (0, pg_core_1.jsonb)("final_scores").$type(),
    total_score: (0, pg_core_1.integer)("total_score"),
    feedback: (0, pg_core_1.text)("feedback"),
    status: (0, pg_core_1.text)("status").default("pending"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    completed_at: (0, pg_core_1.timestamp)("completed_at"),
}, function (table) { return ({
    userIdIdx: (0, pg_core_1.index)("grading_sessions_user_id_idx").on(table.user_id),
    rubricIdIdx: (0, pg_core_1.index)("grading_sessions_rubric_id_idx").on(table.rubric_id),
    statusIdx: (0, pg_core_1.index)("grading_sessions_status_idx").on(table.status),
}); });
exports.insertGradingSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gradingSessions);
// ============================================
// ACADEMIC INTEGRITY CHECKS TABLE
// ============================================
exports.academicIntegrityChecks = (0, pg_core_1.pgTable)("academic_integrity_checks", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    grading_session_id: (0, pg_core_1.uuid)("grading_session_id").references(function () { return exports.gradingSessions.id; }, { onDelete: 'cascade' }).notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }).notNull(),
    plagiarism_detected: (0, pg_core_1.boolean)("plagiarism_detected").default(false),
    plagiarism_score: (0, pg_core_1.integer)("plagiarism_score"),
    plagiarism_sources: (0, pg_core_1.jsonb)("plagiarism_sources").$type(),
    ai_detected: (0, pg_core_1.boolean)("ai_detected").default(false),
    ai_confidence_score: (0, pg_core_1.integer)("ai_confidence_score"),
    ai_detection_details: (0, pg_core_1.jsonb)("ai_detection_details").$type(),
    citation_issues_found: (0, pg_core_1.boolean)("citation_issues_found").default(false),
    citation_issue_count: (0, pg_core_1.integer)("citation_issue_count").default(0),
    citation_issues: (0, pg_core_1.jsonb)("citation_issues").$type(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    gradingSessionIdx: (0, pg_core_1.index)("academic_integrity_grading_session_idx").on(table.grading_session_id),
    userIdIdx: (0, pg_core_1.index)("academic_integrity_user_id_idx").on(table.user_id),
    plagiarismIdx: (0, pg_core_1.index)("academic_integrity_plagiarism_idx").on(table.plagiarism_detected),
    aiDetectedIdx: (0, pg_core_1.index)("academic_integrity_ai_detected_idx").on(table.ai_detected),
}); });
exports.insertAcademicIntegrityCheckSchema = (0, drizzle_zod_1.createInsertSchema)(exports.academicIntegrityChecks);
// ============================================
// ERROR PATTERNS TABLE
// ============================================
exports.errorPatterns = (0, pg_core_1.pgTable)("error_patterns", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    grading_session_id: (0, pg_core_1.uuid)("grading_session_id").references(function () { return exports.gradingSessions.id; }, { onDelete: 'cascade' }).notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }).notNull(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }).notNull(),
    error_category: (0, pg_core_1.text)("error_category").notNull(),
    error_type: (0, pg_core_1.text)("error_type").notNull(),
    error_count: (0, pg_core_1.integer)("error_count").default(1),
    affected_criterion: (0, pg_core_1.text)("affected_criterion"),
    severity: (0, pg_core_1.text)("severity"),
    error_details: (0, pg_core_1.jsonb)("error_details").$type(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    gradingSessionIdx: (0, pg_core_1.index)("error_patterns_grading_session_idx").on(table.grading_session_id),
    userIdIdx: (0, pg_core_1.index)("error_patterns_user_id_idx").on(table.user_id),
    categoryIdx: (0, pg_core_1.index)("error_patterns_category_idx").on(table.error_category),
    typeIdx: (0, pg_core_1.index)("error_patterns_type_idx").on(table.error_type),
}); });
exports.insertErrorPatternSchema = (0, drizzle_zod_1.createInsertSchema)(exports.errorPatterns);
// ============================================
// CRITERION PERFORMANCE TABLE
// ============================================
exports.criterionPerformance = (0, pg_core_1.pgTable)("criterion_performance", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    grading_session_id: (0, pg_core_1.uuid)("grading_session_id").references(function () { return exports.gradingSessions.id; }, { onDelete: 'cascade' }).notNull(),
    rubric_id: (0, pg_core_1.uuid)("rubric_id").references(function () { return exports.rubrics.id; }).notNull(),
    criterion_id: (0, pg_core_1.uuid)("criterion_id").references(function () { return exports.rubricCriteria.id; }).notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").references(function () { return exports.users.id; }).notNull(),
    score_received: (0, pg_core_1.integer)("score_received").notNull(),
    max_score: (0, pg_core_1.integer)("max_score").notNull(),
    percentage: (0, pg_core_1.integer)("percentage").notNull(),
    common_strengths: (0, pg_core_1.jsonb)("common_strengths").$type(),
    common_weaknesses: (0, pg_core_1.jsonb)("common_weaknesses").$type(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, function (table) { return ({
    rubricCriterionIdx: (0, pg_core_1.index)("criterion_performance_rubric_criterion_idx").on(table.rubric_id, table.criterion_id),
    userIdIdx: (0, pg_core_1.index)("criterion_performance_user_id_idx").on(table.user_id),
}); });
exports.insertCriterionPerformanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.criterionPerformance);
// ============================================
// RELATIONS
// ============================================
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var many = _a.many;
    return ({
        subscriptions: many(exports.subscriptions),
        rubrics: many(exports.rubrics),
        gradingSessions: many(exports.gradingSessions),
        desktopSessions: many(exports.desktopSessions),
        assignmentUploads: many(exports.assignmentUploads),
        auditLogs: many(exports.auditLogs),
        academicIntegrityChecks: many(exports.academicIntegrityChecks),
        errorPatterns: many(exports.errorPatterns),
        criterionPerformance: many(exports.criterionPerformance),
    });
});
exports.subscriptionsRelations = (0, drizzle_orm_1.relations)(exports.subscriptions, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.subscriptions.user_id],
            references: [exports.users.id],
        }),
        plan: one(exports.subscriptionPlans, {
            fields: [exports.subscriptions.plan_id],
            references: [exports.subscriptionPlans.id],
        }),
    });
});
exports.rubricsRelations = (0, drizzle_orm_1.relations)(exports.rubrics, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(exports.users, {
            fields: [exports.rubrics.user_id],
            references: [exports.users.id],
        }),
        criteria: many(exports.rubricCriteria),
        latePolicies: many(exports.latePolicies),
        revisionPolicies: many(exports.revisionPolicies),
        gradingSessions: many(exports.gradingSessions),
        errorPatterns: many(exports.errorPatterns),
        criterionPerformance: many(exports.criterionPerformance),
    });
});
exports.rubricCriteriaRelations = (0, drizzle_orm_1.relations)(exports.rubricCriteria, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        rubric: one(exports.rubrics, {
            fields: [exports.rubricCriteria.rubric_id],
            references: [exports.rubrics.id],
        }),
        criterionPerformance: many(exports.criterionPerformance),
    });
});
exports.latePoliciesRelations = (0, drizzle_orm_1.relations)(exports.latePolicies, function (_a) {
    var one = _a.one;
    return ({
        rubric: one(exports.rubrics, {
            fields: [exports.latePolicies.rubric_id],
            references: [exports.rubrics.id],
        }),
    });
});
exports.revisionPoliciesRelations = (0, drizzle_orm_1.relations)(exports.revisionPolicies, function (_a) {
    var one = _a.one;
    return ({
        rubric: one(exports.rubrics, {
            fields: [exports.revisionPolicies.rubric_id],
            references: [exports.rubrics.id],
        }),
    });
});
exports.gradingSessionsRelations = (0, drizzle_orm_1.relations)(exports.gradingSessions, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        user: one(exports.users, {
            fields: [exports.gradingSessions.user_id],
            references: [exports.users.id],
        }),
        rubric: one(exports.rubrics, {
            fields: [exports.gradingSessions.rubric_id],
            references: [exports.rubrics.id],
        }),
        academicIntegrityCheck: one(exports.academicIntegrityChecks, {
            fields: [exports.gradingSessions.id],
            references: [exports.academicIntegrityChecks.grading_session_id],
        }),
        errorPatterns: many(exports.errorPatterns),
        criterionPerformance: many(exports.criterionPerformance),
    });
});
exports.assignmentUploadsRelations = (0, drizzle_orm_1.relations)(exports.assignmentUploads, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.assignmentUploads.user_id],
            references: [exports.users.id],
        }),
    });
});
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.auditLogs.user_id],
            references: [exports.users.id],
        }),
    });
});
exports.academicIntegrityChecksRelations = (0, drizzle_orm_1.relations)(exports.academicIntegrityChecks, function (_a) {
    var one = _a.one;
    return ({
        gradingSession: one(exports.gradingSessions, {
            fields: [exports.academicIntegrityChecks.grading_session_id],
            references: [exports.gradingSessions.id],
        }),
        user: one(exports.users, {
            fields: [exports.academicIntegrityChecks.user_id],
            references: [exports.users.id],
        }),
    });
});
exports.errorPatternsRelations = (0, drizzle_orm_1.relations)(exports.errorPatterns, function (_a) {
    var one = _a.one;
    return ({
        gradingSession: one(exports.gradingSessions, {
            fields: [exports.errorPatterns.grading_session_id],
            references: [exports.gradingSessions.id],
        }),
        user: one(exports.users, {
            fields: [exports.errorPatterns.user_id],
            references: [exports.users.id],
        }),
        rubric: one(exports.rubrics, {
            fields: [exports.errorPatterns.rubric_id],
            references: [exports.rubrics.id],
        }),
    });
});
exports.criterionPerformanceRelations = (0, drizzle_orm_1.relations)(exports.criterionPerformance, function (_a) {
    var one = _a.one;
    return ({
        gradingSession: one(exports.gradingSessions, {
            fields: [exports.criterionPerformance.grading_session_id],
            references: [exports.gradingSessions.id],
        }),
        rubric: one(exports.rubrics, {
            fields: [exports.criterionPerformance.rubric_id],
            references: [exports.rubrics.id],
        }),
        criterion: one(exports.rubricCriteria, {
            fields: [exports.criterionPerformance.criterion_id],
            references: [exports.rubricCriteria.id],
        }),
        user: one(exports.users, {
            fields: [exports.criterionPerformance.user_id],
            references: [exports.users.id],
        }),
    });
});
// ============================================
// LEGACY ZOD SCHEMAS (Keep for compatibility)
// ============================================
exports.proficiencyLevelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Level name is required"),
    score: zod_1.z.number().min(0, "Score must be positive"),
    description: zod_1.z.string(),
});
exports.criterionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Criterion name is required"),
    weight: zod_1.z.number().min(1, "Weight must be at least 1").max(100, "Weight cannot exceed 100"),
    levels: zod_1.z.array(exports.proficiencyLevelSchema).min(1, "At least one proficiency level is required"),
});
exports.educationLevelSchema = zod_1.z.enum([
    "middle_school",
    "high_school",
    "tech_college",
    "four_year_college",
    "graduate"
]);
exports.templateTypeSchema = zod_1.z.enum(["essay", "presentation"]);
exports.latePolicySchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    description: zod_1.z.string().optional(),
});
exports.revisionPolicySchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    description: zod_1.z.string().optional(),
});
exports.rubricSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Rubric name is required"),
    description: zod_1.z.string().optional(),
    criteria: zod_1.z.array(exports.criterionSchema),
    totalPoints: zod_1.z.number(),
    isTemplate: zod_1.z.boolean().default(false),
    educationLevel: exports.educationLevelSchema.optional(),
    templateType: exports.templateTypeSchema.optional(),
    latePolicy: exports.latePolicySchema.optional(),
    revisionPolicy: exports.revisionPolicySchema.optional(),
    minimumLength: zod_1.z.string().optional(),
    timeLimit: zod_1.z.string().optional(),
});
