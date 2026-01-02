CREATE TABLE "academic_integrity_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grading_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"plagiarism_detected" boolean DEFAULT false,
	"plagiarism_score" integer,
	"plagiarism_sources" jsonb,
	"ai_detected" boolean DEFAULT false,
	"ai_confidence_score" integer,
	"ai_detection_details" jsonb,
	"citation_issues_found" boolean DEFAULT false,
	"citation_issue_count" integer DEFAULT 0,
	"citation_issues" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignment_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"upload_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assignment_uploads_user_month_unique" UNIQUE("user_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "criterion_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grading_session_id" uuid NOT NULL,
	"rubric_id" uuid NOT NULL,
	"criterion_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score_received" integer NOT NULL,
	"max_score" integer NOT NULL,
	"percentage" integer NOT NULL,
	"common_strengths" jsonb,
	"common_weaknesses" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "desktop_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"last_validated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "desktop_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "error_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grading_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rubric_id" uuid NOT NULL,
	"error_category" text NOT NULL,
	"error_type" text NOT NULL,
	"error_count" integer DEFAULT 1,
	"affected_criterion" text,
	"severity" text,
	"error_details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rubric_id" uuid NOT NULL,
	"document_name" text,
	"document_url" text,
	"document_text" text,
	"ai_scores" jsonb,
	"final_scores" jsonb,
	"total_score" integer,
	"feedback" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "late_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rubric_id" uuid NOT NULL,
	"hours_late_min" integer NOT NULL,
	"hours_late_max" integer,
	"point_deduction" integer NOT NULL,
	"custom_rule" text,
	"order_position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revision_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rubric_id" uuid NOT NULL,
	"revisions_allowed" integer DEFAULT 1,
	"max_revision_score" integer NOT NULL,
	"revision_deadline_days" integer NOT NULL,
	"revision_conditions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rubric_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rubric_id" uuid NOT NULL,
	"criterion_name" text NOT NULL,
	"criterion_description" text,
	"max_points" integer NOT NULL,
	"order_position" integer NOT NULL,
	"scoring_guide" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rubrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"rubric_summary" text,
	"rubric_type" text NOT NULL,
	"academic_level" text NOT NULL,
	"total_points" integer DEFAULT 100,
	"minimum_word_count" integer,
	"time_limit_minutes" integer,
	"late_policy_enabled" boolean DEFAULT true,
	"revision_policy_enabled" boolean DEFAULT true,
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tier" text NOT NULL,
	"stripe_price_id" text,
	"stripe_product_id" text,
	"price_cents" integer DEFAULT 0,
	"billing_period" text,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid,
	"tier" text NOT NULL,
	"status" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"expires_at" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "academic_integrity_checks" ADD CONSTRAINT "academic_integrity_checks_grading_session_id_grading_sessions_id_fk" FOREIGN KEY ("grading_session_id") REFERENCES "public"."grading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_integrity_checks" ADD CONSTRAINT "academic_integrity_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_uploads" ADD CONSTRAINT "assignment_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterion_performance" ADD CONSTRAINT "criterion_performance_grading_session_id_grading_sessions_id_fk" FOREIGN KEY ("grading_session_id") REFERENCES "public"."grading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterion_performance" ADD CONSTRAINT "criterion_performance_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterion_performance" ADD CONSTRAINT "criterion_performance_criterion_id_rubric_criteria_id_fk" FOREIGN KEY ("criterion_id") REFERENCES "public"."rubric_criteria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterion_performance" ADD CONSTRAINT "criterion_performance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desktop_sessions" ADD CONSTRAINT "desktop_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_patterns" ADD CONSTRAINT "error_patterns_grading_session_id_grading_sessions_id_fk" FOREIGN KEY ("grading_session_id") REFERENCES "public"."grading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_patterns" ADD CONSTRAINT "error_patterns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_patterns" ADD CONSTRAINT "error_patterns_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_sessions" ADD CONSTRAINT "grading_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_sessions" ADD CONSTRAINT "grading_sessions_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_policies" ADD CONSTRAINT "late_policies_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revision_policies" ADD CONSTRAINT "revision_policies_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubric_id_rubrics_id_fk" FOREIGN KEY ("rubric_id") REFERENCES "public"."rubrics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_integrity_grading_session_idx" ON "academic_integrity_checks" USING btree ("grading_session_id");--> statement-breakpoint
CREATE INDEX "academic_integrity_user_id_idx" ON "academic_integrity_checks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "academic_integrity_plagiarism_idx" ON "academic_integrity_checks" USING btree ("plagiarism_detected");--> statement-breakpoint
CREATE INDEX "academic_integrity_ai_detected_idx" ON "academic_integrity_checks" USING btree ("ai_detected");--> statement-breakpoint
CREATE INDEX "assignment_uploads_user_month_idx" ON "assignment_uploads" USING btree ("user_id","year","month");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "criterion_performance_rubric_criterion_idx" ON "criterion_performance" USING btree ("rubric_id","criterion_id");--> statement-breakpoint
CREATE INDEX "criterion_performance_user_id_idx" ON "criterion_performance" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "desktop_sessions_user_id_idx" ON "desktop_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "desktop_sessions_token_idx" ON "desktop_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "error_patterns_grading_session_idx" ON "error_patterns" USING btree ("grading_session_id");--> statement-breakpoint
CREATE INDEX "error_patterns_user_id_idx" ON "error_patterns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "error_patterns_category_idx" ON "error_patterns" USING btree ("error_category");--> statement-breakpoint
CREATE INDEX "error_patterns_type_idx" ON "error_patterns" USING btree ("error_type");--> statement-breakpoint
CREATE INDEX "grading_sessions_user_id_idx" ON "grading_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "grading_sessions_rubric_id_idx" ON "grading_sessions" USING btree ("rubric_id");--> statement-breakpoint
CREATE INDEX "grading_sessions_status_idx" ON "grading_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "late_policies_rubric_id_idx" ON "late_policies" USING btree ("rubric_id");--> statement-breakpoint
CREATE INDEX "revision_policies_rubric_id_idx" ON "revision_policies" USING btree ("rubric_id");--> statement-breakpoint
CREATE INDEX "rubric_criteria_rubric_id_idx" ON "rubric_criteria" USING btree ("rubric_id");--> statement-breakpoint
CREATE INDEX "rubrics_user_id_idx" ON "rubrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rubrics_type_idx" ON "rubrics" USING btree ("rubric_type");--> statement-breakpoint
CREATE INDEX "rubrics_academic_level_idx" ON "rubrics" USING btree ("academic_level");--> statement-breakpoint
CREATE INDEX "rubrics_is_template_idx" ON "rubrics" USING btree ("is_template");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_tier_idx" ON "subscriptions" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");