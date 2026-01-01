import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import { 
  authenticateToken, 
  generateToken, 
  hashPassword, 
  comparePassword,
  type AuthRequest 
} from './auth';
import { 
  requireAdmin,
  requireFeature,
  checkRubricCreationLimit,
  checkAssignmentUploadLimitMiddleware,
  incrementAssignmentUpload,
  getUserFeatures,
  logAdminAction,
  isAdmin,
  checkAssignmentUploadLimit,
} from './featureGate';
import { supabaseAdmin } from './supabase';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'user',
      })
      .select()
      .single();

    if (userError) throw userError;

    // Get trial plan
    const { data: trialPlan } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('tier', 'trial')
      .single();

    // Create trial subscription (7 days)
    if (trialPlan) {
      const trialExpires = new Date();
      trialExpires.setDate(trialExpires.getDate() + 7);

      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: trialPlan.id,
          tier: 'trial',
          status: 'active',
          expires_at: trialExpires.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: trialExpires.toISOString(),
        });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await comparePassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', req.user!.userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// USER FEATURES & SUBSCRIPTION
// ============================================

// Get user features
app.get("/api/user/features", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const features = await getUserFeatures(req.user!.userId);

    if (!features) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    res.json(features);
  } catch (error: any) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to get features' });
  }
});

// Get user subscription
app.get("/api/user/subscription", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', req.user!.userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    res.json({ subscription });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// ============================================
// RUBRIC ROUTES
// ============================================

// Get all rubrics for user
app.get("/api/rubrics", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: rubrics } = await supabaseAdmin
      .from('rubrics')
      .select(`
        *,
        rubric_criteria (*),
        late_policies (*),
        revision_policies (*)
      `)
      .eq('user_id', req.user!.userId)
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    res.json({ rubrics: rubrics || [] });
  } catch (error: any) {
    console.error('Get rubrics error:', error);
    res.status(500).json({ error: 'Failed to get rubrics' });
  }
});

// Get rubric templates
app.get("/api/rubrics/templates", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { rubric_type, academic_level } = req.query;

    let query = supabaseAdmin
      .from('rubrics')
      .select(`
        *,
        rubric_criteria (*),
        late_policies (*),
        revision_policies (*)
      `)
      .eq('is_template', true);

    if (rubric_type) {
      query = query.eq('rubric_type', rubric_type);
    }
    if (academic_level) {
      query = query.eq('academic_level', academic_level);
    }

    const { data: templates } = await query;

    res.json({ templates: templates || [] });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create rubric
app.post("/api/rubrics", 
  authenticateToken, 
  checkRubricCreationLimit,
  async (req: AuthRequest, res: Response) => {
    try {
      const rubricData = req.body;

      // Create rubric
      const { data: rubric, error: rubricError } = await supabaseAdmin
        .from('rubrics')
        .insert({
          user_id: req.user!.userId,
          name: rubricData.name,
          description: rubricData.description,
          rubric_summary: rubricData.rubric_summary,
          rubric_type: rubricData.rubric_type,
          academic_level: rubricData.academic_level,
          total_points: rubricData.total_points,
          minimum_word_count: rubricData.minimum_word_count,
          time_limit_minutes: rubricData.time_limit_minutes,
          late_policy_enabled: rubricData.late_policy_enabled,
          revision_policy_enabled: rubricData.revision_policy_enabled,
          is_template: false,
        })
        .select()
        .single();

      if (rubricError) throw rubricError;

      // Create criteria
      if (rubricData.criteria && rubricData.criteria.length > 0) {
        const criteriaToInsert = rubricData.criteria.map((c: any, index: number) => ({
          rubric_id: rubric.id,
          criterion_name: c.criterion_name,
          criterion_description: c.criterion_description,
          max_points: c.max_points,
          order_position: index,
          scoring_guide: c.scoring_guide,
        }));

        await supabaseAdmin
          .from('rubric_criteria')
          .insert(criteriaToInsert);
      }

      // Create late policies
      if (rubricData.late_policies && rubricData.late_policies.length > 0) {
        const latePolicies = rubricData.late_policies.map((lp: any, index: number) => ({
          rubric_id: rubric.id,
          hours_late_min: lp.hours_late_min,
          hours_late_max: lp.hours_late_max,
          point_deduction: lp.point_deduction,
          custom_rule: lp.custom_rule,
          order_position: index,
        }));

        await supabaseAdmin
          .from('late_policies')
          .insert(latePolicies);
      }

      // Create revision policies
      if (rubricData.revision_policy) {
        await supabaseAdmin
          .from('revision_policies')
          .insert({
            rubric_id: rubric.id,
            ...rubricData.revision_policy,
          });
      }

      res.status(201).json({ rubric });
    } catch (error: any) {
      console.error('Create rubric error:', error);
      res.status(500).json({ error: 'Failed to create rubric' });
    }
  }
);

// Get single rubric
app.get("/api/rubrics/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: rubric } = await supabaseAdmin
      .from('rubrics')
      .select(`
        *,
        rubric_criteria (*),
        late_policies (*),
        revision_policies (*)
      `)
      .eq('id', id)
      .single();

    if (!rubric) {
      return res.status(404).json({ error: 'Rubric not found' });
    }

    // Check ownership (unless it's a template)
    if (!rubric.is_template && rubric.user_id !== req.user!.userId) {
      const userIsAdmin = await isAdmin(req.user!.userId);
      if (!userIsAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ rubric });
  } catch (error: any) {
    console.error('Get rubric error:', error);
    res.status(500).json({ error: 'Failed to get rubric' });
  }
});

// Delete rubric
app.delete("/api/rubrics/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: rubric } = await supabaseAdmin
      .from('rubrics')
      .select('user_id, is_template')
      .eq('id', id)
      .single();

    if (!rubric) {
      return res.status(404).json({ error: 'Rubric not found' });
    }

    // Check ownership
    if (rubric.user_id !== req.user!.userId) {
      const userIsAdmin = await isAdmin(req.user!.userId);
      if (!userIsAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Don't allow deleting templates unless admin
    if (rubric.is_template) {
      const userIsAdmin = await isAdmin(req.user!.userId);
      if (!userIsAdmin) {
        return res.status(403).json({ error: 'Cannot delete templates' });
      }
    }

    await supabaseAdmin
      .from('rubrics')
      .delete()
      .eq('id', id);

    res.json({ message: 'Rubric deleted successfully' });
  } catch (error: any) {
    console.error('Delete rubric error:', error);
    res.status(500).json({ error: 'Failed to delete rubric' });
  }
});

// ============================================
// GRADING SESSION ROUTES
// ============================================

// Create grading session
app.post("/api/grading-sessions",
  authenticateToken,
  checkAssignmentUploadLimitMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { rubric_id, document_name, document_url, document_text } = req.body;

      // Verify rubric exists and user has access
      const { data: rubric } = await supabaseAdmin
        .from('rubrics')
        .select('id, user_id, is_template')
        .eq('id', rubric_id)
        .single();

      if (!rubric) {
        return res.status(404).json({ error: 'Rubric not found' });
      }

      if (!rubric.is_template && rubric.user_id !== req.user!.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create grading session
      const { data: session, error } = await supabaseAdmin
        .from('grading_sessions')
        .insert({
          user_id: req.user!.userId,
          rubric_id,
          document_name,
          document_url,
          document_text,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Increment upload count
      await incrementAssignmentUpload(req.user!.userId);

      res.status(201).json({ session });
    } catch (error: any) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create grading session' });
    }
  }
);

// Get all grading sessions
app.get("/api/grading-sessions", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('grading_sessions')
      .select(`
        *,
        rubrics (name, rubric_type)
      `)
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions } = await query;

    res.json({ sessions: sessions || [] });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get grading sessions' });
  }
});

// Get single grading session
app.get("/api/grading-sessions/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: session } = await supabaseAdmin
      .from('grading_sessions')
      .select(`
        *,
        rubrics (
          *,
          rubric_criteria (*)
        ),
        academic_integrity_checks (*),
        error_patterns (*),
        criterion_performance (*)
      `)
      .eq('id', id)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check ownership
    if (session.user_id !== req.user!.userId) {
      const userIsAdmin = await isAdmin(req.user!.userId);
      if (!userIsAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ session });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Update grading session (save AI scores)
app.patch("/api/grading-sessions/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: session } = await supabaseAdmin
      .from('grading_sessions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.user_id !== req.user!.userId) {
      const userIsAdmin = await isAdmin(req.user!.userId);
      if (!userIsAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: updatedSession, error } = await supabaseAdmin
      .from('grading_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ session: updatedSession });
  } catch (error: any) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// ============================================
// DESKTOP APP VALIDATION
// ============================================

// Validate desktop session
app.post("/api/desktop/validate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Check if user has anonymizer access
    const features = await getUserFeatures(userId);

    if (!features || !features.features.anonymizer) {
      return res.status(403).json({
        error: 'Anonymizer access required',
        message: 'Please upgrade to Pro or Plus plan',
        upgradeUrl: '/subscription',
      });
    }

    // Create or update desktop session
    const token = `desktop_${userId}_${Date.now()}`;

    await supabaseAdmin
      .from('desktop_sessions')
      .insert({
        user_id: userId,
        token,
      });

    res.json({
      valid: true,
      subscriptionActive: true,
      tier: features.tier,
      expiresAt: features.expiresAt,
      features: {
        anonymizer: features.features.anonymizer,
      },
    });
  } catch (error: any) {
    console.error('Desktop validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

// ============================================
// DASHBOARD ANALYTICS ROUTES
// ============================================

// Get dashboard overview
app.get("/api/dashboard/overview", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const { count: totalGraded } = await supabaseAdmin
      .from('grading_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    const { count: pendingReview } = await supabaseAdmin
      .from('grading_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    const { data: completedSessions } = await supabaseAdmin
      .from('grading_sessions')
      .select('total_score, rubrics(total_points)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('total_score', 'is', null);

    let averageGrade = 0;
    if (completedSessions && completedSessions.length > 0) {
      const percentages = completedSessions.map(s => {
        const totalPoints = s.rubrics?.total_points || 100;
        return (s.total_score! / totalPoints) * 100;
      });
      averageGrade = Math.round(
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      );
    }

    const timeSavedMinutes = (totalGraded || 0) * 10;
    const timeSavedHours = Math.floor(timeSavedMinutes / 60);

    res.json({
      assignments_graded: totalGraded || 0,
      pending_review: pendingReview || 0,
      average_grade: averageGrade,
      time_saved_hours: timeSavedHours,
      time_saved_minutes: timeSavedMinutes % 60,
    });
  } catch (error: any) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Failed to get overview' });
  }
});

// Get academic integrity summary
app.get("/api/dashboard/academic-integrity",
  authenticateToken,
  requireFeature('academic_integrity'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const { data: checks } = await supabaseAdmin
        .from('academic_integrity_checks')
        .select('*')
        .eq('user_id', userId);

      const total = checks?.length || 0;
      const plagiarismCount = checks?.filter(c => c.plagiarism_detected).length || 0;
      const aiCount = checks?.filter(c => c.ai_detected).length || 0;
      const citationCount = checks?.filter(c => c.citation_issues_found).length || 0;

      res.json({
        total_assignments: total,
        plagiarism: {
          count: plagiarismCount,
          percentage: total > 0 ? Math.round((plagiarismCount / total) * 100) : 0,
        },
        ai_detection: {
          count: aiCount,
          percentage: total > 0 ? Math.round((aiCount / total) * 100) : 0,
        },
        citation_issues: {
          count: citationCount,
          percentage: total > 0 ? Math.round((citationCount / total) * 100) : 0,
        },
      });
    } catch (error: any) {
      console.error('Get academic integrity error:', error);
      res.status(500).json({ error: 'Failed to get data' });
    }
  }
);

// Get common errors
app.get("/api/dashboard/common-errors",
  authenticateToken,
  requireFeature('error_tracking'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { category } = req.query;

      const { data: errors } = await supabaseAdmin
        .from('error_patterns')
        .select('error_type, error_category, error_count')
        .eq('user_id', userId);

      if (!errors) {
        return res.json({ category: category || 'all', common_errors: [] });
      }

      // Group by error type and sum counts
      const errorMap = new Map<string, { type: string; category: string; total: number }>();

      errors.forEach(error => {
        if (category && error.error_category !== category) return;

        const key = error.error_type;
        if (!errorMap.has(key)) {
          errorMap.set(key, {
            type: error.error_type,
            category: error.error_category,
            total: 0,
          });
        }
        errorMap.get(key)!.total += error.error_count;
      });

      const sortedErrors = Array.from(errorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      res.json({
        category: category || 'all',
        common_errors: sortedErrors,
      });
    } catch (error: any) {
      console.error('Get common errors error:', error);
      res.status(500).json({ error: 'Failed to get error patterns' });
    }
  }
);

// Get rubric criteria performance
app.get("/api/dashboard/criteria-performance",
  authenticateToken,
  requireFeature('analytics_dashboard'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { rubric_id } = req.query;

      const { data: performances } = await supabaseAdmin
        .from('criterion_performance')
        .select(`
          criterion_id,
          percentage,
          rubric_criteria (criterion_name)
        `)
        .eq('user_id', userId);

      if (!performances) {
        return res.json({ criteria_performance: [] });
      }

      // Group by criterion and calculate averages
      const criterionMap = new Map<string, { name: string; total: number; count: number }>();

      performances.forEach(perf => {
        const key = perf.criterion_id;
        if (!criterionMap.has(key)) {
          criterionMap.set(key, {
            name: perf.rubric_criteria?.criterion_name || 'Unknown',
            total: 0,
            count: 0,
          });
        }
        const data = criterionMap.get(key)!;
        data.total += perf.percentage;
        data.count += 1;
      });

      const result = Array.from(criterionMap.entries()).map(([id, data]) => ({
        criterion_id: id,
        criterion_name: data.name,
        avg_percentage: Math.round(data.total / data.count),
        assignment_count: data.count,
      }));

      res.json({ criteria_performance: result });
    } catch (error: any) {
      console.error('Get criteria performance error:', error);
      res.status(500).json({ error: 'Failed to get performance data' });
    }
  }
);

// Get score distribution
app.get("/api/dashboard/score-distribution",
  authenticateToken,
  requireFeature('analytics_dashboard'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const { data: sessions } = await supabaseAdmin
        .from('grading_sessions')
        .select('total_score, rubrics(total_points)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('total_score', 'is', null);

      if (!sessions || sessions.length === 0) {
        return res.json({
          distribution: {
            range_90_100: 0,
            range_80_89: 0,
            range_70_79: 0,
            range_60_69: 0,
            range_below_60: 0,
          },
          total: 0,
          average: 0,
          median: 0,
        });
      }

      const percentages = sessions.map(s => {
        const totalPoints = s.rubrics?.total_points || 100;
        return Math.round((s.total_score! / totalPoints) * 100);
      });

      const distribution = {
        range_90_100: percentages.filter(p => p >= 90).length,
        range_80_89: percentages.filter(p => p >= 80 && p < 90).length,
        range_70_79: percentages.filter(p => p >= 70 && p < 80).length,
        range_60_69: percentages.filter(p => p >= 60 && p < 70).length,
        range_below_60: percentages.filter(p => p < 60).length,
      };

      const average = Math.round(
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      );

      const sorted = [...percentages].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      res.json({
        distribution,
        total: percentages.length,
        average,
        median,
      });
    } catch (error: any) {
      console.error('Get distribution error:', error);
      res.status(500).json({ error: 'Failed to get distribution' });
    }
  }
);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (admin only)
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    await logAdminAction(
      req.user!.userId,
      'view_all_users',
      'users',
      null,
      { count: users?.length || 0 },
      req.ip
    );

    res.json({ users: users || [] });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user details (admin only)
app.get("/api/admin/users/:userId", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscriptions (
          *,
          subscription_plans (*)
        )
      `)
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { count: rubricsCount } = await supabaseAdmin
      .from('rubrics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const now = new Date();
    const { data: uploadStats } = await supabaseAdmin
      .from('assignment_uploads')
      .select('upload_count')
      .eq('user_id', userId)
      .eq('year', now.getFullYear())
      .eq('month', now.getMonth() + 1)
      .single();

    await logAdminAction(
      req.user!.userId,
      'view_user_details',
      'user',
      userId,
      {},
      req.ip
    );

    res.json({
      user,
      stats: {
        rubrics: rubricsCount || 0,
        uploadsThisMonth: uploadStats?.upload_count || 0,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user subscription (admin only)
app.post("/api/admin/users/:userId/subscription",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { tier, duration } = req.body;

      if (!['free', 'trial', 'basic', 'pro', 'plus', 'admin'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier' });
      }

      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id')
        .eq('tier', tier)
        .single();

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (duration || 30));

      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: plan.id,
          tier,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAction(
        req.user!.userId,
        'change_user_subscription',
        'subscription',
        subscription.id,
        { userId, tier, duration },
        req.ip
      );

      res.json({
        success: true,
        message: `Subscription updated to ${tier}`,
        subscription,
      });
    } catch (error: any) {
      console.error('Update subscription error:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  }
);

// Make user admin (admin only)
app.post("/api/admin/users/:userId/make-admin",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const { error } = await supabaseAdmin
        .from('users')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      const { data: adminPlan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id')
        .eq('tier', 'admin')
        .single();

      if (adminPlan) {
        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: adminPlan.id,
            tier: 'admin',
            status: 'active',
            expires_at: new Date('2099-12-31').toISOString(),
          });
      }

      await logAdminAction(
        req.user!.userId,
        'make_user_admin',
        'user',
        userId,
        {},
        req.ip
      );

      res.json({
        success: true,
        message: 'User granted admin privileges',
      });
    } catch (error: any) {
      console.error('Make admin error:', error);
      res.status(500).json({ error: 'Failed to grant admin privileges' });
    }
  }
);

// Revoke admin (admin only)
app.post("/api/admin/users/:userId/revoke-admin",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      if (userId === req.user!.userId) {
        return res.status(400).json({ error: 'Cannot revoke your own admin privileges' });
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update({ role: 'user', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      await logAdminAction(
        req.user!.userId,
        'revoke_user_admin',
        'user',
        userId,
        {},
        req.ip
      );

      res.json({
        success: true,
        message: 'Admin privileges revoked',
      });
    } catch (error: any) {
      console.error('Revoke admin error:', error);
      res.status(500).json({ error: 'Failed to revoke admin' });
    }
  }
);

// Get system analytics (admin only)
app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { data: subscriptionStats } = await supabaseAdmin
      .from('subscriptions')
      .select('tier')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    const tierCounts = subscriptionStats?.reduce((acc: any, sub: any) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    }, {});

    const { count: totalRubrics } = await supabaseAdmin
      .from('rubrics')
      .select('*', { count: 'exact', head: true });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: sessionsThisMonth } = await supabaseAdmin
      .from('grading_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    await logAdminAction(
      req.user!.userId,
      'view_analytics',
      'system',
      null,
      {},
      req.ip
    );

    res.json({
      totalUsers: totalUsers || 0,
      subscriptionsByTier: tierCounts || {},
      totalRubrics: totalRubrics || 0,
      gradingSessionsThisMonth: sessionsThisMonth || 0,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get audit logs (admin only)
app.get("/api/admin/audit-logs", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs')
      .select(`
        *,
        users (email, name)
      `)
      .order('created_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ logs: logs || [] });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// Delete user (admin only)
app.delete("/api/admin/users/:userId", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    await logAdminAction(
      req.user!.userId,
      'delete_user',
      'user',
      userId,
      {},
      req.ip
    );

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

  return httpServer;
}