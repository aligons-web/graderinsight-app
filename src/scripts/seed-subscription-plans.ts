import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptionPlans } from '../../shared/schema';

const DATABASE_URL = process.env.GRADER_DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('❌ GRADER_DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans with analytics features...\n');

  const plans = [
    {
      name: 'Free',
      tier: 'free',
      priceCents: 0,
      features: {
        custom_rubrics: false,
        ai_grading: false,
        anonymizer_app: false,
        user_dashboard: false,
        analytics_dashboard: false,
        error_tracking: false,
        academic_integrity_tracking: false,
        max_rubrics: 3,
        max_monthly_uploads: 10,
      },
    },
    {
      name: 'Trial',
      tier: 'trial',
      priceCents: 0,
      billingPeriod: '7_days',
      features: {
        custom_rubrics: true,
        ai_grading: true,
        anonymizer_app: true,
        user_dashboard: true,
        analytics_dashboard: true,
        error_tracking: true,
        academic_integrity_tracking: true,
        max_rubrics: 10,
        max_monthly_uploads: 100,
      },
    },
    {
      name: 'Basic',
      tier: 'basic',
      priceCents: 999,
      billingPeriod: 'month',
      features: {
        custom_rubrics: true,
        ai_grading: true,
        anonymizer_app: false,
        user_dashboard: false,
        analytics_dashboard: false,
        error_tracking: false,
        academic_integrity_tracking: false,
        max_rubrics: 50,
        max_monthly_uploads: 200,
      },
    },
    {
      name: 'Pro',
      tier: 'pro',
      priceCents: 1999,
      billingPeriod: 'month',
      features: {
        custom_rubrics: true,
        ai_grading: true,
        anonymizer_app: true,
        user_dashboard: false,
        analytics_dashboard: false,
        error_tracking: false,
        academic_integrity_tracking: false,
        max_rubrics: 100,
        max_monthly_uploads: 500,
      },
    },
    {
      name: 'Plus',
      tier: 'plus',
      priceCents: 2999,
      billingPeriod: 'month',
      features: {
        custom_rubrics: true,
        ai_grading: true,
        anonymizer_app: true,
        user_dashboard: true,
        analytics_dashboard: true,
        error_tracking: true,
        academic_integrity_tracking: true,
        max_rubrics: null,
        max_monthly_uploads: 1500,
      },
    },
    {
      name: 'Admin',
      tier: 'admin',
      priceCents: 0,
      features: {
        custom_rubrics: true,
        ai_grading: true,
        anonymizer_app: true,
        user_dashboard: true,
        analytics_dashboard: true,
        error_tracking: true,
        academic_integrity_tracking: true,
        admin_user_management: true,
        admin_subscription_management: true,
        admin_system_settings: true,
        admin_audit_logs: true,
        max_rubrics: null,
        max_monthly_uploads: null,
      },
    },
  ];

  try {
    const existingPlans = await db.select().from(subscriptionPlans);

    if (existingPlans.length > 0) {
      console.log('⚠️  Plans already exist. To update, delete existing plans first.');
      console.log('   Run this SQL in Supabase to clear plans:');
      console.log('   DELETE FROM subscription_plans;\n');
      return;
    }

    for (const plan of plans) {
      await db.insert(subscriptionPlans).values(plan);
      const priceDisplay = plan.priceCents === 0 
        ? 'Free' 
        : `$${(plan.priceCents / 100).toFixed(2)}${plan.billingPeriod ? '/' + plan.billingPeriod : ''}`;
      console.log(`✅ Successfully seeded subscription plans:`);
      console.log(`📦 ${plan.name} (${plan.tier}): ${priceDisplay}`);
    }

    console.log('\n🎉 Seed completed!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedSubscriptionPlans();