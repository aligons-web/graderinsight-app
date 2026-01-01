import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';
import { supabaseAdmin } from './supabase';

interface SubscriptionFeatures {
  tier: string;
  subscriptionActive: boolean;
  expiresAt: string | null;
  features: {
    maxRubrics: number;
    maxAssignmentsPerMonth: number;
    anonymizer: boolean;
    analytics: boolean;
    academicIntegrity: boolean;
    errorTracking: boolean;
    prioritySupport: boolean;
  };
}

const TIER_FEATURES: Record<string, SubscriptionFeatures['features']> = {
  trial: {
    maxRubrics: 3,
    maxAssignmentsPerMonth: 10,
    anonymizer: false,
    analytics: false,
    academicIntegrity: false,
    errorTracking: false,
    prioritySupport: false,
  },
  basic: {
    maxRubrics: 10,
    maxAssignmentsPerMonth: 100,
    anonymizer: false,
    analytics: false,
    academicIntegrity: false,
    errorTracking: false,
    prioritySupport: false,
  },
  pro: {
    maxRubrics: 50,
    maxAssignmentsPerMonth: 500,
    anonymizer: true,
    analytics: true,
    academicIntegrity: true,
    errorTracking: true,
    prioritySupport: true,
  },
  enterprise: {
    maxRubrics: -1,
    maxAssignmentsPerMonth: 1500,
    anonymizer: true,
    analytics: true,
    academicIntegrity: true,
    errorTracking: true,
    prioritySupport: true,
  },
};

export async function getUserFeatures(userId: string): Promise<SubscriptionFeatures> {
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  const tier = subscription?.tier || 'trial';
  const isActive = subscription?.status === 'active' || tier === 'trial';
  const expiresAt = subscription?.expires_at || null;

  return {
    tier,
    subscriptionActive: isActive,
    expiresAt,
    features: TIER_FEATURES[tier] || TIER_FEATURES.trial,
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return user?.role === 'admin';
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  isAdmin(req.user!.userId).then((admin) => {
    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }).catch((error) => {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  });
}

export function requireFeature(featureName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const features = await getUserFeatures(req.user!.userId);
      const featureKey = featureName.replace(/_/g, '') as keyof typeof features.features;
      
      const featureMap: Record<string, keyof SubscriptionFeatures['features']> = {
        'academic_integrity': 'academicIntegrity',
        'error_tracking': 'errorTracking',
        'analytics_dashboard': 'analytics',
        'anonymizer': 'anonymizer',
        'priority_support': 'prioritySupport',
      };

      const mappedKey = featureMap[featureName] || featureName;
      const hasFeature = features.features[mappedKey as keyof typeof features.features];

      if (!hasFeature) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `This feature requires a higher subscription tier`,
          requiredFeature: featureName,
          currentTier: features.tier,
        });
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({ error: 'Feature check failed' });
    }
  };
}

export async function checkRubricCreationLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const features = await getUserFeatures(req.user!.userId);
    
    if (features.features.maxRubrics === -1) {
      return next();
    }

    const { count } = await supabaseAdmin
      .from('rubrics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user!.userId);

    if ((count || 0) >= features.features.maxRubrics) {
      return res.status(403).json({
        error: 'Rubric limit reached',
        message: `Your ${features.tier} plan allows ${features.features.maxRubrics} rubrics. Please upgrade to create more.`,
        currentCount: count,
        limit: features.features.maxRubrics,
      });
    }

    next();
  } catch (error) {
    console.error('Rubric limit check error:', error);
    res.status(500).json({ error: 'Limit check failed' });
  }
}

export async function checkAssignmentUploadLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const features = await getUserFeatures(userId);
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from('assignment_uploads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  const current = count || 0;
  const limit = features.features.maxAssignmentsPerMonth;

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function checkAssignmentUploadLimitMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await checkAssignmentUploadLimit(req.user!.userId);

    if (!result.allowed) {
      return res.status(403).json({
        error: 'Upload limit reached',
        message: `You've reached your monthly limit of ${result.limit} assignments. Please upgrade your plan.`,
        currentCount: result.current,
        limit: result.limit,
      });
    }

    next();
  } catch (error) {
    console.error('Upload limit check error:', error);
    res.status(500).json({ error: 'Limit check failed' });
  }
}

export async function incrementAssignmentUpload(userId: string): Promise<void> {
  await supabaseAdmin
    .from('assignment_uploads')
    .insert({
      user_id: userId,
      created_at: new Date().toISOString(),
    });
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await supabaseAdmin
    .from('admin_audit_logs')
    .insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    });
}
