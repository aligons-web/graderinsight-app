-- ============================================================
-- GraderInsight: Supabase → Railway PostgreSQL Migration
-- Complete schema recreation with tables, indexes, constraints
-- Run this against your Railway PostgreSQL database
-- ============================================================

-- Enable UUID extension (Railway PostgreSQL needs this explicitly)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);

-- ============================================================
-- 2. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  price_cents INTEGER DEFAULT 0,
  billing_period TEXT,
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITHOUT TIME ZONE,
  current_period_end TIMESTAMP WITHOUT TIME ZONE,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status);
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON subscriptions (tier);

-- ============================================================
-- 4. ASSIGNMENT UPLOADS (monthly tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS assignment_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  upload_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT assignment_uploads_user_month_unique UNIQUE (user_id, year, month)
);

CREATE INDEX IF NOT EXISTS assignment_uploads_user_month_idx ON assignment_uploads (user_id, year, month);

-- ============================================================
-- 5. DESKTOP SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS desktop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  last_validated TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS desktop_sessions_user_id_idx ON desktop_sessions (user_id);
CREATE INDEX IF NOT EXISTS desktop_sessions_token_idx ON desktop_sessions (token);

-- ============================================================
-- 6. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at);

-- ============================================================
-- 7. RUBRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rubric_summary TEXT,
  rubric_type TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  total_points INTEGER DEFAULT 100,
  minimum_word_count INTEGER,
  time_limit_minutes INTEGER,
  late_policy_enabled BOOLEAN DEFAULT TRUE,
  revision_policy_enabled BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rubrics_user_id_idx ON rubrics (user_id);
CREATE INDEX IF NOT EXISTS rubrics_type_idx ON rubrics (rubric_type);
CREATE INDEX IF NOT EXISTS rubrics_academic_level_idx ON rubrics (academic_level);
CREATE INDEX IF NOT EXISTS rubrics_is_template_idx ON rubrics (is_template);

-- ============================================================
-- 8. RUBRIC CRITERIA
-- ============================================================
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  criterion_name TEXT NOT NULL,
  criterion_description TEXT,
  max_points INTEGER NOT NULL,
  order_position INTEGER NOT NULL,
  scoring_guide JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rubric_criteria_rubric_id_idx ON rubric_criteria (rubric_id);

-- ============================================================
-- 9. LATE POLICIES
-- ============================================================
CREATE TABLE IF NOT EXISTS late_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  hours_late_min INTEGER NOT NULL,
  hours_late_max INTEGER,
  point_deduction INTEGER NOT NULL,
  custom_rule TEXT,
  order_position INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS late_policies_rubric_id_idx ON late_policies (rubric_id);

-- ============================================================
-- 10. REVISION POLICIES
-- ============================================================
CREATE TABLE IF NOT EXISTS revision_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  revisions_allowed INTEGER DEFAULT 1,
  max_revision_score INTEGER NOT NULL,
  revision_deadline_days INTEGER NOT NULL,
  revision_conditions TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS revision_policies_rubric_id_idx ON revision_policies (rubric_id);

-- ============================================================
-- 11. GRADING SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS grading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES rubrics(id),
  document_name TEXT,
  document_url TEXT,
  document_text TEXT,
  ai_scores JSONB,
  final_scores JSONB,
  total_score INTEGER,
  feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS grading_sessions_user_id_idx ON grading_sessions (user_id);
CREATE INDEX IF NOT EXISTS grading_sessions_rubric_id_idx ON grading_sessions (rubric_id);
CREATE INDEX IF NOT EXISTS grading_sessions_status_idx ON grading_sessions (status);

-- ============================================================
-- 12. ACADEMIC INTEGRITY CHECKS
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_integrity_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_session_id UUID NOT NULL REFERENCES grading_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  plagiarism_detected BOOLEAN DEFAULT FALSE,
  plagiarism_score INTEGER,
  plagiarism_sources JSONB,
  ai_detected BOOLEAN DEFAULT FALSE,
  ai_confidence_score INTEGER,
  ai_detection_details JSONB,
  citation_issues_found BOOLEAN DEFAULT FALSE,
  citation_issue_count INTEGER DEFAULT 0,
  citation_issues JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS academic_integrity_grading_session_idx ON academic_integrity_checks (grading_session_id);
CREATE INDEX IF NOT EXISTS academic_integrity_user_id_idx ON academic_integrity_checks (user_id);
CREATE INDEX IF NOT EXISTS academic_integrity_plagiarism_idx ON academic_integrity_checks (plagiarism_detected);
CREATE INDEX IF NOT EXISTS academic_integrity_ai_detected_idx ON academic_integrity_checks (ai_detected);

-- ============================================================
-- 13. ERROR PATTERNS
-- ============================================================
CREATE TABLE IF NOT EXISTS error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_session_id UUID NOT NULL REFERENCES grading_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  rubric_id UUID NOT NULL REFERENCES rubrics(id),
  error_category TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_count INTEGER DEFAULT 1,
  affected_criterion TEXT,
  severity TEXT,
  error_details JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_patterns_grading_session_idx ON error_patterns (grading_session_id);
CREATE INDEX IF NOT EXISTS error_patterns_user_id_idx ON error_patterns (user_id);
CREATE INDEX IF NOT EXISTS error_patterns_category_idx ON error_patterns (error_category);
CREATE INDEX IF NOT EXISTS error_patterns_type_idx ON error_patterns (error_type);

-- ============================================================
-- 14. CRITERION PERFORMANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS criterion_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grading_session_id UUID NOT NULL REFERENCES grading_sessions(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES rubrics(id),
  criterion_id UUID NOT NULL REFERENCES rubric_criteria(id),
  user_id UUID NOT NULL REFERENCES users(id),
  score_received INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  common_strengths JSONB,
  common_weaknesses JSONB,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS criterion_performance_rubric_criterion_idx ON criterion_performance (rubric_id, criterion_id);
CREATE INDEX IF NOT EXISTS criterion_performance_user_id_idx ON criterion_performance (user_id);

-- ============================================================
-- DONE: All 14 tables + all indexes created
-- ============================================================