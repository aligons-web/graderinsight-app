import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';
import { supabaseAdmin } from './supabase';

/**
 * Check if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const adminStatus = await isAdmin(req.user.userId);

  if (!adminStatus) {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This endpoint requires administrator privileges',
    });
  }

  next();
}

/**
 * Check if a user has access to a specific feature based on their subscription
 * ADMIN USERS BYPASS ALL CHECKS
 */
export async function checkFeatureAccess(
  userId: string,
  featureName: string
): Promise<{ hasAccess: boolean; tier: string | null; reason?: string; isAdmin?: boolean }> {
  try {
    // Check if user is admin first - admins bypass all checks
    const adminStatus = await isAdmin(userId);
    if (adminStatus) {
      return {
        hasAccess: true,
        tier: 'admin',
        isAdmin: true,
      };
    }

    // Get user's active subscription with plan details
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          tier,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return {
        hasAccess: false,
        tier: null,
        reason: 'No active subscription',
      };
    }

    const plan = subscription.subscription_plans;

    if (!plan?.features) {
      return {
        hasAccess: false,
        tier: subscription.tier,
        reason: 'Plan features not configured',
      };
    }

    const features = plan.features as Record<string, any>;
    const hasFeature = features[featureName] === true;

    return {
      hasAccess: hasFeature,
      tier: subscription.tier,
      reason: hasFeature ? undefined : `Feature not available in ${subscription.tier} plan`,
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      hasAccess: false,
      tier: null,
      reason: 'Error checking subscription',
    };
  }
}

/**
 * Middleware to require a specific feature for route access
 * ADMIN USERS BYPASS THIS CHECK
 */
export function requireFeature(featureName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const { hasAccess, tier, reason, isAdmin } = await checkFeatureAccess(
      req.user.userId,
      featureName
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Feature not available',
        feature: featureName,
        currentTier: tier,
        reason,
        upgradeRequired: !isAdmin,
        upgradeUrl: '/subscription',
      });
    }

    next();
  };
}

/**
 * Check rubric creation limit based on subscription tier
 * ADMIN USERS HAVE UNLIMITED RUBRICS
 */
export async function checkRubricLimit(userId: string): Promise<{
  canCreate: boolean;
  currentCount: number;
  limit: number | null;
  reason?: string;
  isAdmin?: boolean;
}> {
  try {
    const adminStatus = await isAdmin(userId);
    if (adminStatus) {
      return {
        canCreate: true,
        currentCount: 0,
        limit: null,
        isAdmin: true,
      };
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return {
        canCreate: false,
        currentCount: 0,
        limit: 0,
        reason: 'No active subscription',
      };
    }

    const features = subscription.subscription_plans?.features as Record<string, any>;
    const maxRubrics = features?.max_rubrics;

    if (maxRubrics === null || maxRubrics === undefined) {
      return {
        canCreate: true,
        currentCount: 0,
        limit: null,
      };
    }

    const { count } = await supabaseAdmin
      .from('rubrics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_template', false);

    const currentCount = count || 0;
    const canCreate = currentCount < maxRubrics;

    return {
      canCreate,
      currentCount,
      limit: maxRubrics,
      reason: canCreate ? undefined : `Rubric limit reached (${maxRubrics})`,
    };
  } catch (error) {
    console.error('Error checking rubric limit:', error);
    return {
      canCreate: false,
      currentCount: 0,
      limit: 0,
      reason: 'Error checking limit',
    };
  }
}

/**
 * Middleware to check rubric creation limit
 */
export async function checkRubricCreationLimit(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await checkRubricLimit(req.user.userId);

  if (!result.canCreate && !result.isAdmin) {
    return res.status(403).json({
      error: 'Rubric limit reached',
      currentCount: result.currentCount,
      limit: result.limit,
      reason: result.reason,
      upgradeRequired: true,
      upgradeUrl: '/subscription',
    });
  }

  next();
}

/**
 * Check assignment upload limit for current month
 * ADMIN USERS HAVE UNLIMITED UPLOADS
 */
export async function checkAssignmentUploadLimit(userId: string): Promise<{
  canUpload: boolean;
  currentCount: number;
  limit: number | null;
  reason?: string;
  isAdmin?: boolean;
}> {
  try {
    const adminStatus = await isAdmin(userId);
    if (adminStatus) {
      return {
        canUpload: true,
        currentCount: 0,
        limit: null,
        isAdmin: true,
      };
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return {
        canUpload: false,
        currentCount: 0,
        limit: 0,
        reason: 'No active subscription',
      };
    }

    const features = subscription.subscription_plans?.features as Record<string, any>;
    const uploadLimit = features?.assignment_uploads_limit;

    if (uploadLimit === null || uploadLimit === undefined) {
      return {
        canUpload: true,
        currentCount: 0,
        limit: null,
      };
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const { data: uploadRecord } = await supabaseAdmin
      .from('assignment_uploads')
      .select('upload_count')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .single();

    const currentCount = uploadRecord?.upload_count || 0;
    const canUpload = currentCount < uploadLimit;

    return {
      canUpload,
      currentCount,
      limit: uploadLimit,
      reason: canUpload ? undefined : `Monthly upload limit reached (${uploadLimit})`,
    };
  } catch (error) {
    console.error('Error checking upload limit:', error);
    return {
      canUpload: false,
      currentCount: 0,
      limit: 0,
      reason: 'Error checking limit',
    };
  }
}

/**
 * Increment assignment upload count for current month
 */
export async function incrementAssignmentUpload(userId: string): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
    const { data: existing } = await supabaseAdmin
      .from('assignment_uploads')
      .select('id, upload_count')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('assignment_uploads')
        .update({
          upload_count: existing.upload_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('assignment_uploads')
        .insert({
          user_id: userId,
          year,
          month,
          upload_count: 1,
        });
    }
  } catch (error) {
    console.error('Error incrementing upload count:', error);
    throw error;
  }
}

/**
 * Middleware to check assignment upload limit
 */
export async function checkAssignmentUploadLimitMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const result = await checkAssignmentUploadLimit(req.user.userId);

  if (!result.canUpload && !result.isAdmin) {
    return res.status(403).json({
      error: 'Monthly upload limit reached',
      currentCount: result.currentCount,
      limit: result.limit,
      reason: result.reason,
      upgradeRequired: true,
      upgradeUrl: '/subscription',
    });
  }

  (req as any).uploadLimit = result;
  next();
}

/**
 * Get user's subscription features
 */
export async function getUserFeatures(userId: string): Promise<{
  tier: string;
  role: string;
  isAdmin: boolean;
  features: Record<string, any>;
  expiresAt: string | null;
  uploadUsage?: {
    current: number;
    limit: number | null;
    remaining: number | null;
  };
} | null> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const userIsAdmin = user?.role === 'admin';

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        tier,
        expires_at,
        subscription_plans (
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      if (userIsAdmin) {
        return {
          tier: 'admin',
          role: 'admin',
          isAdmin: true,
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
            analytics_dashboard: true,
            error_tracking: true,
            academic_integrity: true,
            user_management: true,
            subscription_management: true,
            system_settings: true,
            analytics: true,
            audit_logs: true,
            template_management: true,
          },
          expiresAt: null,
        };
      }
      return null;
    }

    const features = subscription.subscription_plans?.features || {};

    const now = new Date();
    const { data: uploadRecord } = await supabaseAdmin
      .from('assignment_uploads')
      .select('upload_count')
      .eq('user_id', userId)
      .eq('year', now.getFullYear())
      .eq('month', now.getMonth() + 1)
      .single();

    const currentUploads = uploadRecord?.upload_count || 0;
    const uploadLimit = userIsAdmin ? null : features.assignment_uploads_limit;
    const remaining = uploadLimit ? uploadLimit - currentUploads : null;

    return {
      tier: subscription.tier,
      role: user?.role || 'user',
      isAdmin: userIsAdmin,
      features,
      expiresAt: subscription.expires_at,
      uploadUsage: {
        current: currentUploads,
        limit: uploadLimit,
        remaining,
      },
    };
  } catch (error) {
    console.error('Error getting user features:', error);
    return null;
  }
}

/**
 * Log admin action to audit log
 */
export async function logAdminAction(
  userId: string,
  action: string,
  entityType: string | null,
  entityId: string | null,
  details: any = {},
  ipAddress?: string
): Promise<void> {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: ipAddress,
      });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}