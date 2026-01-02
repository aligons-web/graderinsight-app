import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptionPlans } from '../../shared/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
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
      stripe_price_id: null,
      stripe_product_id: null,
      price_cents: 0,
      billing_period: 'lifetime',
      features: {
        max_rubrics: 3,
        custom_rubrics: false,
        template_access: true,
        assignment_uploads_limit: 10,
        ai_grading: false,
        anonymizer: false,
        user_dashboard: false,
        bulk_export: false,
        advanced_rubrics: false,
        analytics_dashboard: false, // ❌ No analytics
        error_tracking: false, // ❌ No error tracking
        academic_integrity: false, // ❌ No academic integrity checks
      },
      is_active: true,
    },
    {
      name: 'Trial',
      tier: 'trial',
      stripe_price_id: null,
      stripe_product_id: null,
      price_cents: 0,
      billing_period: null,
      features: {
        max_rubrics: 10,
        custom_rubrics: true,
        template_access: true,
        assignment_uploads_limit: 100,
        ai_grading: true,
        anonymizer: true,
        user_dashboard: true,
        bulk_export: true,
        advanced_rubrics: true,
        analytics_dashboard: true, // ✅ Full analytics during trial
        error_tracking: true, // ✅ Error tracking
        academic_integrity: true, // ✅ Academic integrity checks
      },
      is_active: true,
    },
    {
      name: 'Basic',
      tier: 'basic',
      stripe_price_id: process.env.STRIPE_BASIC_PRICE_ID || null,
      stripe_product_id: process.env.STRIPE_BASIC_PRODUCT_ID || null,
      price_cents: 999, // $9.99/month
      billing_period: 'monthly',
      features: {
        max_rubrics: 50,
        custom_rubrics: true,
        template_access: true,
        assignment_uploads_limit: 200,
        ai_grading: true,
        anonymizer: false,
        user_dashboard: false,
        bulk_export: true,
        advanced_rubrics: true,
        analytics_dashboard: false, // ❌ No analytics
        error_tracking: false, // ❌ No error tracking
        academic_integrity: false, // ❌ No academic integrity checks
      },
      is_active: true,
    },
    {
      name: 'Pro',
      tier: 'pro',
      stripe_price_id: process.env.STRIPE_PRO_PRICE_ID || null,
      stripe_product_id: process.env.STRIPE_PRO_PRODUCT_ID || null,
      price_cents: 1999, // $19.99/month
      billing_period: 'monthly',
      features: {
        max_rubrics: 100,
        custom_rubrics: true,
        template_access: true,
        assignment_uploads_limit: 500,
        ai_grading: true,
        anonymizer: true,
        user_dashboard: false,
        bulk_export: true,
        advanced_rubrics: true,
        analytics_dashboard: false, // ❌ No full analytics
        error_tracking: false, // ❌ No error tracking
        academic_integrity: false, // ❌ No academic integrity checks
      },
      is_active: true,
    },
    {
      name: 'Plus',
      tier: 'plus',
      stripe_price_id: process.env.STRIPE_PLUS_PRICE_ID || null,
      stripe_product_id: process.env.STRIPE_PLUS_PRODUCT_ID || null,
      price_cents: 2999, // $29.99/month
      billing_period: 'monthly',
      features: {
        max_rubrics: null, // Unlimited
        custom_rubrics: true,
        template_access: true,
        assignment_uploads_limit: 1500,
        ai_grading: true,
        anonymizer: true,
        user_dashboard: true,
        bulk_export: true,
        advanced_rubrics: true,
        analytics_dashboard: true, // ✅ FULL ANALYTICS DASHBOARD
        error_tracking: true, // ✅ Writing/Presentation error tracking
        academic_integrity: true, // ✅ Plagiarism, AI, citation tracking
      },
      is_active: true,
    },
    {
      name: 'Admin',
      tier: 'admin',
      stripe_price_id: null,
      stripe_product_id: null,
      price_cents: 0,
      billing_period: 'lifetime',
      features: {
        max_rubrics: null,
        custom_rubrics: true,
        template_access: true,
        assignment_uploads_limit: null,
        ai_grading: true,
        anonymizer: true,
        user_dashboard: true,
        bulk_export: true,
        advanced_rubrics: true,
        analytics_dashboard: true, // ✅ FULL ANALYTICS
        error_tracking: true, // ✅ Error tracking
        academic_integrity: true, // ✅ Academic integrity
        user_management: true,
        subscription_management: true,
        system_settings: true,
        analytics: true,
        audit_logs: true,
        template_management: true,
      },
      is_active: true,
    },
  ];

  try {
    await db.insert(subscriptionPlans).values(plans);

    console.log('✅ Successfully seeded subscription plans:\n');

    plans.forEach(plan => {
      const price = plan.price_cents === 0 
        ? 'Free' 
        : `$${(plan.price_cents / 100).toFixed(2)}/${plan.billing_period === 'yearly' ? 'year' : 'month'}`;

      console.log(`📦 ${plan.name} (${plan.tier}): ${price}`);
      console.log(`   ├─ Custom Rubrics: ${plan.features.custom_rubrics ? '✅' : '❌'}`);
      console.log(`   ├─ Template Access: ${plan.features.template_access ? '✅' : '❌'}`);
      console.log(`   ├─ Max Rubrics: ${plan.features.max_rubrics || 'Unlimited'}`);
      console.log(`   ├─ Uploads/Month: ${plan.features.assignment_uploads_limit || 'Unlimited'}`);
      console.log(`   ├─ AI Grading: ${plan.features.ai_grading ? '✅' : '❌'}`);
      console.log(`   ├─ Anonymizer: ${plan.features.anonymizer ? '✅' : '❌'}`);
      console.log(`   ├─ User Dashboard: ${plan.features.user_dashboard ? '✅' : '❌'}`);
      console.log(`   ├─ Analytics Dashboard: ${plan.features.analytics_dashboard ? '✅ FULL ACCESS' : '❌'}`);
      console.log(`   ├─ Error Tracking: ${plan.features.error_tracking ? '✅ Writing/Presentation' : '❌'}`);
      console.log(`   └─ Academic Integrity: ${plan.features.academic_integrity ? '✅ Plagiarism/AI/Citations' : '❌'}`);

      if (plan.tier === 'admin') {
        console.log(`   └─ Admin Features: User/Sub Management, System Settings, Audit Logs`);
      }
      console.log('');
    });

    console.log('\n📊 Analytics Features Summary:');
    console.log('   Free/Basic/Pro: ❌ No analytics access');
    console.log('   Plus Plan: ✅ Full analytics dashboard');
    console.log('      - Common writing errors tracking');
    console.log('      - Common presentation errors tracking');
    console.log('      - Plagiarism detection results');
    console.log('      - AI content detection');
    console.log('      - Citation issues tracking');
    console.log('      - Rubric criteria performance');
    console.log('      - Score distribution charts');
    console.log('   Admin Plan: ✅ All analytics + system-wide data');

  } catch (error: any) {
    if (error.code === '23505') {
      console.log('⚠️  Plans already exist. To update, delete existing plans first.');
      console.log('\n   Run this SQL in Supabase to clear plans:');
      console.log('   DELETE FROM subscription_plans;\n');
    } else {
      console.error('❌ Error seeding plans:', error);
      throw error;
    }
  } finally {
    await sql.end();
  }
}

seedSubscriptionPlans()
  .then(() => {
    console.log('🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });