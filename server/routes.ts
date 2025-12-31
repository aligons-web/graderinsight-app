import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRubricSchema, rubricSchema } from "@shared/schema";
import { supabaseAdmin } from "./supabase";
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticateToken,
  checkSubscription,
  verifyToken,  // ← FIXED: Added this import
  type AuthRequest 
} from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({ email, password_hash: passwordHash, name })
        .select()
        .single();

      if (userError || !user) {
        console.error('User creation error:', userError);
        throw new Error("Failed to create user");
      }

      // Create trial subscription (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: 'trial',
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (subError) {
        console.error('Subscription creation error:', subError);
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      // Get user
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await comparePassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check subscription
      const subscription = await checkSubscription(user.id);

      // Generate token
      const token = generateToken(user.id, user.email);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  // Get current user profile
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, name, created_at')
        .eq('id', req.user!.userId)
        .single();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const subscription = await checkSubscription(user.id);

      res.json({ user, subscription });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // ============================================
  // SUBSCRIPTION ROUTES
  // ============================================

  // Get subscription status
  app.get("/api/subscription", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const subscription = await checkSubscription(req.user!.userId);

      if (!subscription) {
        return res.json({ 
          subscriptionActive: false,
          message: "No active subscription"
        });
      }

      res.json({
        subscriptionActive: true,
        tier: subscription.tier,
        status: subscription.status,
        expiresAt: subscription.expires_at
      });
    } catch (error) {
      console.error('Subscription fetch error:', error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Upgrade subscription
  app.post("/api/subscription/upgrade", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { tier } = req.body;

      if (!['basic', 'pro', 'enterprise'].includes(tier)) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }

      const durations: Record<string, number> = {
        'basic': 30,
        'pro': 30,
        'enterprise': 365
      };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durations[tier]);

      const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: req.user!.userId,
          tier,
          status: 'active',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: `${tier} subscription activated!`,
        subscription
      });
    } catch (error: any) {
      console.error('Subscription upgrade error:', error);
      res.status(500).json({ error: error.message || "Failed to upgrade subscription" });
    }
  });

  // Desktop app login
  app.post("/api/desktop/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Authenticate user
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await comparePassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check subscription
      const subscription = await checkSubscription(user.id);
      if (!subscription) {
        return res.status(403).json({ 
          message: "No active subscription. Please subscribe at the web portal." 
        });
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      // Store desktop session
      await supabaseAdmin
        .from('desktop_sessions')
        .insert({
          user_id: user.id,
          token
        });

      res.json({
        token,
        user: {
          email: user.email,
          name: user.name,
          tier: subscription.tier,
          expiresAt: subscription.expires_at
        }
      });
    } catch (error: any) {
      console.error('Desktop login error:', error);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Validate desktop subscription
  app.post("/api/desktop/validate", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.json({ subscriptionActive: false });
    }

    try {
      const decoded = verifyToken(token);  // ← Now properly imported
      if (!decoded) {
        return res.json({ subscriptionActive: false });
      }

      const subscription = await checkSubscription(decoded.userId);

      if (!subscription) {
        return res.json({ subscriptionActive: false });
      }

      // Update last validated
      await supabaseAdmin
        .from('desktop_sessions')
        .update({ last_validated: new Date().toISOString() })
        .eq('token', token);

      res.json({
        subscriptionActive: true,
        tier: subscription.tier,
        expiresAt: subscription.expires_at
      });
    } catch (error) {
      console.error('Desktop validation error:', error);
      res.json({ subscriptionActive: false });
    }
  });

  // ============================================
  // EXISTING RUBRIC ROUTES (NOW PROTECTED)
  // ============================================

  app.get("/api/rubrics", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const rubrics = await storage.getAllRubrics();
      res.json(rubrics);
    } catch (error) {
      console.error('Rubrics fetch error:', error);
      res.status(500).json({ error: "Failed to fetch rubrics" });
    }
  });

  app.get("/api/rubrics/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const rubric = await storage.getRubric(req.params.id);
      if (!rubric) {
        return res.status(404).json({ error: "Rubric not found" });
      }
      res.json(rubric);
    } catch (error) {
      console.error('Rubric fetch error:', error);
      res.status(500).json({ error: "Failed to fetch rubric" });
    }
  });

  app.post("/api/rubrics", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const parsed = insertRubricSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid rubric data", details: parsed.error.errors });
      }

      const rubric = await storage.createRubric(parsed.data);
      res.status(201).json(rubric);
    } catch (error) {
      console.error('Rubric creation error:', error);
      res.status(500).json({ error: "Failed to create rubric" });
    }
  });

  app.put("/api/rubrics/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const parsed = rubricSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid rubric data", details: parsed.error.errors });
      }
      const rubric = await storage.updateRubric(req.params.id, parsed.data);
      if (!rubric) {
        return res.status(404).json({ error: "Rubric not found" });
      }
      res.json(rubric);
    } catch (error) {
      console.error('Rubric update error:', error);
      res.status(500).json({ error: "Failed to update rubric" });
    }
  });

  app.delete("/api/rubrics/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteRubric(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rubric not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Rubric deletion error:', error);
      res.status(500).json({ error: "Failed to delete rubric" });
    }
  });

  return httpServer;
}
