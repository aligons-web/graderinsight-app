import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import {
  authenticateToken,
  generateToken,
  hashPassword,
  comparePassword,
  type AuthRequest,
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
import { query, queryOne, queryCount, execute } from './db';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============================================
  // HEALTH CHECK
  // ============================================
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ============================================
  // AUTH ROUTES
  // ============================================

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Check if user exists
      const existingUser = await queryOne(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await queryOne<{
        id: string; email: string; name: string; role: string;
      }>(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, email, name, role`,
        [email, passwordHash, name]
      );

      if (!user) throw new Error('Failed to create user');

      // Get trial plan
      const trialPlan = await queryOne<{ id: string }>(
        "SELECT id FROM subscription_plans WHERE tier = 'trial'",
        []
      );

      // Create trial subscription (7 days)
      if (trialPlan) {
        const trialExpires = new Date();
        trialExpires.setDate(trialExpires.getDate() + 7);

        await execute(
          `INSERT INTO subscriptions
             (user_id, plan_id, tier, status, expires_at, current_period_start, current_period_end)
           VALUES ($1, $2, 'trial', 'active', $3, NOW(), $3)`,
          [user.id, trialPlan.id, trialExpires.toISOString()]
        );
      }

      // Generate token
      const token = generateToken(user.id, user.email, user.role);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await queryOne<{
        id: string; email: string; name: string; role: string; password_hash: string;
      }>(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

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
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await queryOne(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [req.user!.userId]
      );

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ user });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // ============================================
  // USER FEATURES & SUBSCRIPTION
  // ============================================

  app.get('/api/user/features', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const features = await getUserFeatures(req.user!.userId);
      if (!features) return res.status(404).json({ error: 'No active subscription' });
      res.json(features);
    } catch (error: any) {
      console.error('Get features error:', error);
      res.status(500).json({ error: 'Failed to get features' });
    }
  });

  app.get('/api/user/subscription', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const subscription = await queryOne(
        `SELECT s.*, row_to_json(sp.*) AS subscription_plans
         FROM subscriptions s
         LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
         WHERE s.user_id = $1
           AND s.status = 'active'
           AND s.expires_at > NOW()
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [req.user!.userId]
      );

      if (!subscription) return res.status(404).json({ error: 'No active subscription' });

      res.json({ subscription });
    } catch (error: any) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Failed to get subscription' });
    }
  });

  // ============================================
  // RUBRIC ROUTES
  // ============================================

  // Get all rubrics for user (with children)
  app.get('/api/rubrics', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const rubrics = await query(
        `SELECT r.*,
           COALESCE(
             (SELECT json_agg(rc.* ORDER BY rc.order_position)
              FROM rubric_criteria rc WHERE rc.rubric_id = r.id),
             '[]'::json
           ) AS rubric_criteria,
           COALESCE(
             (SELECT json_agg(lp.* ORDER BY lp.order_position)
              FROM late_policies lp WHERE lp.rubric_id = r.id),
             '[]'::json
           ) AS late_policies,
           COALESCE(
             (SELECT json_agg(rp.*)
              FROM revision_policies rp WHERE rp.rubric_id = r.id),
             '[]'::json
           ) AS revision_policies
         FROM rubrics r
         WHERE r.user_id = $1 AND r.is_template = false
         ORDER BY r.created_at DESC`,
        [req.user!.userId]
      );

      res.json({ rubrics });
    } catch (error: any) {
      console.error('Get rubrics error:', error);
      res.status(500).json({ error: 'Failed to get rubrics' });
    }
  });

  // Get rubric templates
  app.get('/api/rubrics/templates', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { rubric_type, academic_level } = req.query;

      let sql = `
        SELECT r.*,
          COALESCE(
            (SELECT json_agg(rc.* ORDER BY rc.order_position)
             FROM rubric_criteria rc WHERE rc.rubric_id = r.id),
            '[]'::json
          ) AS rubric_criteria,
          COALESCE(
            (SELECT json_agg(lp.* ORDER BY lp.order_position)
             FROM late_policies lp WHERE lp.rubric_id = r.id),
            '[]'::json
          ) AS late_policies,
          COALESCE(
            (SELECT json_agg(rp.*)
             FROM revision_policies rp WHERE rp.rubric_id = r.id),
            '[]'::json
          ) AS revision_policies
        FROM rubrics r
        WHERE r.is_template = true`;

      const params: any[] = [];
      let idx = 1;

      if (rubric_type) {
        sql += ` AND r.rubric_type = $${idx++}`;
        params.push(rubric_type);
      }
      if (academic_level) {
        sql += ` AND r.academic_level = $${idx++}`;
        params.push(academic_level);
      }

      const templates = await query(sql, params);
      res.json({ templates });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  });

  // Create rubric
  app.post('/api/rubrics',
    authenticateToken,
    checkRubricCreationLimit,
    async (req: AuthRequest, res: Response) => {
      try {
        const d = req.body;

        // Create rubric
        const rubric = await queryOne(
          `INSERT INTO rubrics
             (user_id, name, description, rubric_summary, rubric_type,
              academic_level, total_points, minimum_word_count, time_limit_minutes,
              late_policy_enabled, revision_policy_enabled, is_template)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false)
           RETURNING *`,
          [
            req.user!.userId, d.name, d.description, d.rubric_summary,
            d.rubric_type, d.academic_level, d.total_points,
            d.minimum_word_count, d.time_limit_minutes,
            d.late_policy_enabled ?? true, d.revision_policy_enabled ?? true,
          ]
        );

        if (!rubric) throw new Error('Failed to create rubric');

        // Create criteria
        if (d.criteria && d.criteria.length > 0) {
          for (let i = 0; i < d.criteria.length; i++) {
            const c = d.criteria[i];
            await execute(
              `INSERT INTO rubric_criteria
                 (rubric_id, criterion_name, criterion_description, max_points,
                  order_position, scoring_guide)
               VALUES ($1,$2,$3,$4,$5,$6)`,
              [
                rubric.id, c.criterion_name, c.criterion_description,
                c.max_points, i, JSON.stringify(c.scoring_guide),
              ]
            );
          }
        }

        // Create late policies
        if (d.late_policies && d.late_policies.length > 0) {
          for (let i = 0; i < d.late_policies.length; i++) {
            const lp = d.late_policies[i];
            await execute(
              `INSERT INTO late_policies
                 (rubric_id, hours_late_min, hours_late_max, point_deduction,
                  custom_rule, order_position)
               VALUES ($1,$2,$3,$4,$5,$6)`,
              [
                rubric.id, lp.hours_late_min, lp.hours_late_max,
                lp.point_deduction, lp.custom_rule, i,
              ]
            );
          }
        }

        // Create revision policy
        if (d.revision_policy) {
          const rp = d.revision_policy;
          await execute(
            `INSERT INTO revision_policies
               (rubric_id, revisions_allowed, max_revision_score,
                revision_deadline_days, revision_conditions)
             VALUES ($1,$2,$3,$4,$5)`,
            [
              rubric.id, rp.revisions_allowed, rp.max_revision_score,
              rp.revision_deadline_days, rp.revision_conditions,
            ]
          );
        }

        res.status(201).json({ rubric });
      } catch (error: any) {
        console.error('Create rubric error:', error);
        res.status(500).json({ error: 'Failed to create rubric' });
      }
    }
  );

  // Get single rubric
  app.get('/api/rubrics/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const rubric = await queryOne(
        `SELECT r.*,
           COALESCE(
             (SELECT json_agg(rc.* ORDER BY rc.order_position)
              FROM rubric_criteria rc WHERE rc.rubric_id = r.id),
             '[]'::json
           ) AS rubric_criteria,
           COALESCE(
             (SELECT json_agg(lp.* ORDER BY lp.order_position)
              FROM late_policies lp WHERE lp.rubric_id = r.id),
             '[]'::json
           ) AS late_policies,
           COALESCE(
             (SELECT json_agg(rp.*)
              FROM revision_policies rp WHERE rp.rubric_id = r.id),
             '[]'::json
           ) AS revision_policies
         FROM rubrics r
         WHERE r.id = $1`,
        [id]
      );

      if (!rubric) return res.status(404).json({ error: 'Rubric not found' });

      if (!rubric.is_template && rubric.user_id !== req.user!.userId) {
        const userIsAdmin = await isAdmin(req.user!.userId);
        if (!userIsAdmin) return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ rubric });
    } catch (error: any) {
      console.error('Get rubric error:', error);
      res.status(500).json({ error: 'Failed to get rubric' });
    }
  });

  // Delete rubric
  app.delete('/api/rubrics/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const rubric = await queryOne<{ user_id: string; is_template: boolean }>(
        'SELECT user_id, is_template FROM rubrics WHERE id = $1',
        [id]
      );

      if (!rubric) return res.status(404).json({ error: 'Rubric not found' });

      if (rubric.user_id !== req.user!.userId) {
        const userIsAdmin = await isAdmin(req.user!.userId);
        if (!userIsAdmin) return res.status(403).json({ error: 'Access denied' });
      }

      if (rubric.is_template) {
        const userIsAdmin = await isAdmin(req.user!.userId);
        if (!userIsAdmin) return res.status(403).json({ error: 'Cannot delete templates' });
      }

      await execute('DELETE FROM rubrics WHERE id = $1', [id]);

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
  app.post('/api/grading-sessions',
    authenticateToken,
    checkAssignmentUploadLimitMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const { rubric_id, document_name, document_url, document_text } = req.body;

        const rubric = await queryOne<{ id: string; user_id: string; is_template: boolean }>(
          'SELECT id, user_id, is_template FROM rubrics WHERE id = $1',
          [rubric_id]
        );

        if (!rubric) return res.status(404).json({ error: 'Rubric not found' });

        if (!rubric.is_template && rubric.user_id !== req.user!.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }

        const session = await queryOne(
          `INSERT INTO grading_sessions
             (user_id, rubric_id, document_name, document_url, document_text, status)
           VALUES ($1,$2,$3,$4,$5,'pending')
           RETURNING *`,
          [req.user!.userId, rubric_id, document_name, document_url, document_text]
        );

        await incrementAssignmentUpload(req.user!.userId);

        res.status(201).json({ session });
      } catch (error: any) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create grading session' });
      }
    }
  );

  // Get all grading sessions
  app.get('/api/grading-sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.query;

      let sql = `
        SELECT gs.*,
          json_build_object('name', r.name, 'rubric_type', r.rubric_type) AS rubrics
        FROM grading_sessions gs
        LEFT JOIN rubrics r ON r.id = gs.rubric_id
        WHERE gs.user_id = $1`;

      const params: any[] = [req.user!.userId];
      let idx = 2;

      if (status) {
        sql += ` AND gs.status = $${idx++}`;
        params.push(status);
      }

      sql += ' ORDER BY gs.created_at DESC';

      const sessions = await query(sql, params);
      res.json({ sessions });
    } catch (error: any) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get grading sessions' });
    }
  });

  // Get single grading session
  app.get('/api/grading-sessions/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const session = await queryOne(
        `SELECT gs.*,
           (SELECT row_to_json(sub.*)
            FROM (
              SELECT r.*,
                COALESCE(
                  (SELECT json_agg(rc.* ORDER BY rc.order_position)
                   FROM rubric_criteria rc WHERE rc.rubric_id = r.id),
                  '[]'::json
                ) AS rubric_criteria
              FROM rubrics r WHERE r.id = gs.rubric_id
            ) sub
           ) AS rubrics,
           COALESCE(
             (SELECT json_agg(aic.*)
              FROM academic_integrity_checks aic WHERE aic.grading_session_id = gs.id),
             '[]'::json
           ) AS academic_integrity_checks,
           COALESCE(
             (SELECT json_agg(ep.*)
              FROM error_patterns ep WHERE ep.grading_session_id = gs.id),
             '[]'::json
           ) AS error_patterns,
           COALESCE(
             (SELECT json_agg(cp.*)
              FROM criterion_performance cp WHERE cp.grading_session_id = gs.id),
             '[]'::json
           ) AS criterion_performance
         FROM grading_sessions gs
         WHERE gs.id = $1`,
        [id]
      );

      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (session.user_id !== req.user!.userId) {
        const userIsAdmin = await isAdmin(req.user!.userId);
        if (!userIsAdmin) return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ session });
    } catch (error: any) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  });

  // Update grading session
  app.patch('/api/grading-sessions/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const session = await queryOne<{ user_id: string }>(
        'SELECT user_id FROM grading_sessions WHERE id = $1',
        [id]
      );

      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (session.user_id !== req.user!.userId) {
        const userIsAdmin = await isAdmin(req.user!.userId);
        if (!userIsAdmin) return res.status(403).json({ error: 'Access denied' });
      }

      // Build dynamic SET clause
      const setClauses: string[] = ['updated_at = NOW()'];
      const params: any[] = [];
      let idx = 1;

      const allowedFields = [
        'ai_scores', 'final_scores', 'total_score', 'feedback',
        'status', 'completed_at', 'document_name', 'document_url', 'document_text',
      ];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          const value = typeof updates[field] === 'object' && updates[field] !== null
            ? JSON.stringify(updates[field])
            : updates[field];
          setClauses.push(`${field} = $${idx++}`);
          params.push(value);
        }
      }

      params.push(id);

      const updatedSession = await queryOne(
        `UPDATE grading_sessions SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING *`,
        params
      );

      res.json({ session: updatedSession });
    } catch (error: any) {
      console.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  });

  // ============================================
  // DESKTOP APP VALIDATION
  // ============================================

  app.post('/api/desktop/validate', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const features = await getUserFeatures(userId);

      if (!features || !features.features.anonymizer) {
        return res.status(403).json({
          error: 'Anonymizer access required',
          message: 'Please upgrade to Pro or Plus plan',
          upgradeUrl: '/subscription',
        });
      }

      const token = `desktop_${userId}_${Date.now()}`;

      await execute(
        'INSERT INTO desktop_sessions (user_id, token) VALUES ($1, $2)',
        [userId, token]
      );

      res.json({
        valid: true,
        subscriptionActive: true,
        tier: features.tier,
        expiresAt: features.expiresAt,
        features: { anonymizer: features.features.anonymizer },
      });
    } catch (error: any) {
      console.error('Desktop validation error:', error);
      res.status(500).json({ error: 'Validation failed' });
    }
  });

  // ============================================
  // DASHBOARD ANALYTICS ROUTES
  // ============================================

  app.get('/api/dashboard/overview', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const totalGraded = await queryCount(
        "SELECT COUNT(*) FROM grading_sessions WHERE user_id = $1 AND status = 'completed'",
        [userId]
      );

      const pendingReview = await queryCount(
        "SELECT COUNT(*) FROM grading_sessions WHERE user_id = $1 AND status = 'pending'",
        [userId]
      );

      const completedSessions = await query<{ total_score: number; total_points: number }>(
        `SELECT gs.total_score, r.total_points
         FROM grading_sessions gs
         LEFT JOIN rubrics r ON r.id = gs.rubric_id
         WHERE gs.user_id = $1
           AND gs.status = 'completed'
           AND gs.total_score IS NOT NULL`,
        [userId]
      );

      let averageGrade = 0;
      if (completedSessions.length > 0) {
        const percentages = completedSessions.map(s => {
          const totalPoints = s.total_points || 100;
          return (s.total_score / totalPoints) * 100;
        });
        averageGrade = Math.round(
          percentages.reduce((sum, p) => sum + p, 0) / percentages.length
        );
      }

      const timeSavedMinutes = totalGraded * 10;
      const timeSavedHours = Math.floor(timeSavedMinutes / 60);

      res.json({
        assignments_graded: totalGraded,
        pending_review: pendingReview,
        average_grade: averageGrade,
        time_saved_hours: timeSavedHours,
        time_saved_minutes: timeSavedMinutes % 60,
      });
    } catch (error: any) {
      console.error('Get overview error:', error);
      res.status(500).json({ error: 'Failed to get overview' });
    }
  });

  app.get('/api/dashboard/academic-integrity',
    authenticateToken,
    requireFeature('academic_integrity'),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.user!.userId;

        const checks = await query(
          'SELECT * FROM academic_integrity_checks WHERE user_id = $1',
          [userId]
        );

        const total = checks.length;
        const plagiarismCount = checks.filter((c: any) => c.plagiarism_detected).length;
        const aiCount = checks.filter((c: any) => c.ai_detected).length;
        const citationCount = checks.filter((c: any) => c.citation_issues_found).length;

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

  app.get('/api/dashboard/common-errors',
    authenticateToken,
    requireFeature('error_tracking'),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.user!.userId;
        const { category } = req.query;

        let sql = `SELECT error_type, error_category, SUM(error_count) AS total
                    FROM error_patterns
                    WHERE user_id = $1`;
        const params: any[] = [userId];
        let idx = 2;

        if (category) {
          sql += ` AND error_category = $${idx++}`;
          params.push(category);
        }

        sql += ' GROUP BY error_type, error_category ORDER BY total DESC LIMIT 10';

        const errors = await query(sql, params);

        res.json({
          category: category || 'all',
          common_errors: errors.map((e: any) => ({
            type: e.error_type,
            category: e.error_category,
            total: parseInt(e.total, 10),
          })),
        });
      } catch (error: any) {
        console.error('Get common errors error:', error);
        res.status(500).json({ error: 'Failed to get error patterns' });
      }
    }
  );

  app.get('/api/dashboard/criteria-performance',
    authenticateToken,
    requireFeature('analytics_dashboard'),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.user!.userId;

        const result = await query(
          `SELECT
             cp.criterion_id,
             rc.criterion_name,
             ROUND(AVG(cp.percentage)) AS avg_percentage,
             COUNT(*)::int AS assignment_count
           FROM criterion_performance cp
           LEFT JOIN rubric_criteria rc ON rc.id = cp.criterion_id
           WHERE cp.user_id = $1
           GROUP BY cp.criterion_id, rc.criterion_name`,
          [userId]
        );

        res.json({ criteria_performance: result });
      } catch (error: any) {
        console.error('Get criteria performance error:', error);
        res.status(500).json({ error: 'Failed to get performance data' });
      }
    }
  );

  app.get('/api/dashboard/score-distribution',
    authenticateToken,
    requireFeature('analytics_dashboard'),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.user!.userId;

        const sessions = await query<{ total_score: number; total_points: number }>(
          `SELECT gs.total_score, r.total_points
           FROM grading_sessions gs
           LEFT JOIN rubrics r ON r.id = gs.rubric_id
           WHERE gs.user_id = $1
             AND gs.status = 'completed'
             AND gs.total_score IS NOT NULL`,
          [userId]
        );

        if (!sessions.length) {
          return res.json({
            distribution: {
              range_90_100: 0, range_80_89: 0, range_70_79: 0,
              range_60_69: 0, range_below_60: 0,
            },
            total: 0, average: 0, median: 0,
          });
        }

        const percentages = sessions.map(s => {
          const tp = s.total_points || 100;
          return Math.round((s.total_score / tp) * 100);
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

        res.json({ distribution, total: percentages.length, average, median });
      } catch (error: any) {
        console.error('Get distribution error:', error);
        res.status(500).json({ error: 'Failed to get distribution' });
      }
    }
  );

  // ============================================
  // ADMIN ROUTES
  // ============================================

  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const users = await query(
        'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
      );

      await logAdminAction(req.user!.userId, 'view_all_users', 'users', null, { count: users.length }, req.ip);

      res.json({ users });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  app.get('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await queryOne(
        `SELECT u.*,
           COALESCE(
             (SELECT json_agg(sub.*)
              FROM (
                SELECT s.*, row_to_json(sp.*) AS subscription_plans
                FROM subscriptions s
                LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
                WHERE s.user_id = u.id
              ) sub
             ),
             '[]'::json
           ) AS subscriptions
         FROM users u WHERE u.id = $1`,
        [userId]
      );

      if (!user) return res.status(404).json({ error: 'User not found' });

      const rubricsCount = await queryCount(
        'SELECT COUNT(*) FROM rubrics WHERE user_id = $1',
        [userId]
      );

      const now = new Date();
      const uploadStats = await queryOne<{ upload_count: number }>(
        `SELECT upload_count FROM assignment_uploads
         WHERE user_id = $1 AND year = $2 AND month = $3`,
        [userId, now.getFullYear(), now.getMonth() + 1]
      );

      await logAdminAction(req.user!.userId, 'view_user_details', 'user', userId, {}, req.ip);

      res.json({
        user,
        stats: {
          rubrics: rubricsCount,
          uploadsThisMonth: uploadStats?.upload_count || 0,
        },
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.post('/api/admin/users/:userId/subscription',
    authenticateToken, requireAdmin,
    async (req: AuthRequest, res: Response) => {
      try {
        const { userId } = req.params;
        const { tier, duration } = req.body;

        if (!['free', 'trial', 'basic', 'pro', 'plus', 'admin'].includes(tier)) {
          return res.status(400).json({ error: 'Invalid tier' });
        }

        const plan = await queryOne<{ id: string }>(
          'SELECT id FROM subscription_plans WHERE tier = $1',
          [tier]
        );

        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (duration || 30));

        // Upsert: deactivate old, insert new
        await execute(
          `UPDATE subscriptions SET status = 'inactive', updated_at = NOW()
           WHERE user_id = $1 AND status = 'active'`,
          [userId]
        );

        const subscription = await queryOne(
          `INSERT INTO subscriptions
             (user_id, plan_id, tier, status, expires_at, current_period_start, current_period_end)
           VALUES ($1,$2,$3,'active',$4,NOW(),$4)
           RETURNING *`,
          [userId, plan.id, tier, expiresAt.toISOString()]
        );

        await logAdminAction(
          req.user!.userId, 'change_user_subscription', 'subscription',
          subscription?.id, { userId, tier, duration }, req.ip
        );

        res.json({ success: true, message: `Subscription updated to ${tier}`, subscription });
      } catch (error: any) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
      }
    }
  );

  app.post('/api/admin/users/:userId/make-admin',
    authenticateToken, requireAdmin,
    async (req: AuthRequest, res: Response) => {
      try {
        const { userId } = req.params;

        await execute(
          "UPDATE users SET role = 'admin', updated_at = NOW() WHERE id = $1",
          [userId]
        );

        const adminPlan = await queryOne<{ id: string }>(
          "SELECT id FROM subscription_plans WHERE tier = 'admin'",
          []
        );

        if (adminPlan) {
          await execute(
            `UPDATE subscriptions SET status = 'inactive', updated_at = NOW()
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
          );

          await execute(
            `INSERT INTO subscriptions
               (user_id, plan_id, tier, status, expires_at)
             VALUES ($1, $2, 'admin', 'active', '2099-12-31')`,
            [userId, adminPlan.id]
          );
        }

        await logAdminAction(req.user!.userId, 'make_user_admin', 'user', userId, {}, req.ip);

        res.json({ success: true, message: 'User granted admin privileges' });
      } catch (error: any) {
        console.error('Make admin error:', error);
        res.status(500).json({ error: 'Failed to grant admin privileges' });
      }
    }
  );

  app.post('/api/admin/users/:userId/revoke-admin',
    authenticateToken, requireAdmin,
    async (req: AuthRequest, res: Response) => {
      try {
        const { userId } = req.params;

        if (userId === req.user!.userId) {
          return res.status(400).json({ error: 'Cannot revoke your own admin privileges' });
        }

        await execute(
          "UPDATE users SET role = 'user', updated_at = NOW() WHERE id = $1",
          [userId]
        );

        await logAdminAction(req.user!.userId, 'revoke_user_admin', 'user', userId, {}, req.ip);

        res.json({ success: true, message: 'Admin privileges revoked' });
      } catch (error: any) {
        console.error('Revoke admin error:', error);
        res.status(500).json({ error: 'Failed to revoke admin' });
      }
    }
  );

  app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const totalUsers = await queryCount('SELECT COUNT(*) FROM users');

      const tierStats = await query(
        `SELECT tier, COUNT(*)::int AS count
         FROM subscriptions
         WHERE status = 'active' AND expires_at > NOW()
         GROUP BY tier`
      );

      const tierCounts = tierStats.reduce((acc: any, row: any) => {
        acc[row.tier] = row.count;
        return acc;
      }, {});

      const totalRubrics = await queryCount('SELECT COUNT(*) FROM rubrics');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const sessionsThisMonth = await queryCount(
        'SELECT COUNT(*) FROM grading_sessions WHERE created_at >= $1',
        [startOfMonth.toISOString()]
      );

      await logAdminAction(req.user!.userId, 'view_analytics', 'system', null, {}, req.ip);

      res.json({
        totalUsers,
        subscriptionsByTier: tierCounts,
        totalRubrics,
        gradingSessionsThisMonth: sessionsThisMonth,
      });
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const logs = await query(
        `SELECT al.*,
           json_build_object('email', u.email, 'name', u.name) AS users
         FROM audit_logs al
         LEFT JOIN users u ON u.id = al.user_id
         ORDER BY al.created_at DESC
         LIMIT $1 OFFSET $2`,
        [Number(limit), Number(offset)]
      );

      res.json({ logs });
    } catch (error: any) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: 'Failed to get audit logs' });
    }
  });

  app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      if (userId === req.user!.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await execute('DELETE FROM users WHERE id = $1', [userId]);

      await logAdminAction(req.user!.userId, 'delete_user', 'user', userId, {}, req.ip);

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Anonymizer app download endpoint
  app.get('/api/apps/anonymizer/download', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const subscription = await queryOne<{ tier: string; status: string; expires_at: string }>(
        'SELECT tier, status, expires_at FROM subscriptions WHERE user_id = $1',
        [userId]
      );

      if (!subscription) {
        return res.status(403).json({ error: 'No active subscription found' });
      }

      if (!['pro', 'plus', 'admin'].includes(subscription.tier)) {
        return res.status(403).json({
          error: 'Anonymizer requires Pro or Plus subscription',
          requiredTier: 'pro',
        });
      }

      if (subscription.status !== 'active' || new Date(subscription.expires_at) < new Date()) {
        return res.status(403).json({ error: 'Subscription expired or inactive' });
      }

      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '../../downloads/anonymizer.zip');

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Anonymizer file not found' });
      }

      res.download(filePath, 'grader-anonymizer.zip');
    } catch (error: any) {
      console.error('Anonymizer download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  return httpServer;
}