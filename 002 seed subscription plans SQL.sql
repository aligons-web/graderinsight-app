-- ============================================================
-- GraderInsight: Seed Data - Subscription Plans
-- Run AFTER 001_create_schema.sql
-- ============================================================

-- Insert subscription plan tiers
-- Adjust features/pricing as needed for your app
INSERT INTO subscription_plans (name, tier, price_cents, billing_period, features, is_active) VALUES
(
  'Free',
  'free',
  0,
  NULL,
  '{
    "max_rubrics": 2,
    "custom_rubrics": false,
    "template_access": true,
    "assignment_uploads_limit": 5,
    "ai_grading": true,
    "anonymizer": false,
    "user_dashboard": true,
    "bulk_export": false,
    "advanced_rubrics": false,
    "analytics_dashboard": false,
    "error_tracking": false,
    "academic_integrity": false
  }'::jsonb,
  true
),
(
  'Trial',
  'trial',
  0,
  NULL,
  '{
    "max_rubrics": 5,
    "custom_rubrics": true,
    "template_access": true,
    "assignment_uploads_limit": 20,
    "ai_grading": true,
    "anonymizer": false,
    "user_dashboard": true,
    "bulk_export": false,
    "advanced_rubrics": false,
    "analytics_dashboard": true,
    "error_tracking": true,
    "academic_integrity": true
  }'::jsonb,
  true
),
(
  'Basic',
  'basic',
  999,
  'monthly',
  '{
    "max_rubrics": 10,
    "custom_rubrics": true,
    "template_access": true,
    "assignment_uploads_limit": 50,
    "ai_grading": true,
    "anonymizer": false,
    "user_dashboard": true,
    "bulk_export": true,
    "advanced_rubrics": false,
    "analytics_dashboard": true,
    "error_tracking": true,
    "academic_integrity": true
  }'::jsonb,
  true
),
(
  'Pro',
  'pro',
  1999,
  'monthly',
  '{
    "max_rubrics": null,
    "custom_rubrics": true,
    "template_access": true,
    "assignment_uploads_limit": 200,
    "ai_grading": true,
    "anonymizer": true,
    "user_dashboard": true,
    "bulk_export": true,
    "advanced_rubrics": true,
    "analytics_dashboard": true,
    "error_tracking": true,
    "academic_integrity": true
  }'::jsonb,
  true
),
(
  'Plus',
  'plus',
  2999,
  'monthly',
  '{
    "max_rubrics": null,
    "custom_rubrics": true,
    "template_access": true,
    "assignment_uploads_limit": null,
    "ai_grading": true,
    "anonymizer": true,
    "user_dashboard": true,
    "bulk_export": true,
    "advanced_rubrics": true,
    "analytics_dashboard": true,
    "error_tracking": true,
    "academic_integrity": true
  }'::jsonb,
  true
),
(
  'Admin',
  'admin',
  0,
  NULL,
  '{
    "max_rubrics": null,
    "custom_rubrics": true,
    "template_access": true,
    "assignment_uploads_limit": null,
    "ai_grading": true,
    "anonymizer": true,
    "user_dashboard": true,
    "bulk_export": true,
    "advanced_rubrics": true,
    "analytics_dashboard": true,
    "error_tracking": true,
    "academic_integrity": true,
    "user_management": true,
    "subscription_management": true,
    "system_settings": true,
    "analytics": true,
    "audit_logs": true,
    "template_management": true
  }'::jsonb,
  true
)
ON CONFLICT (tier) DO NOTHING;