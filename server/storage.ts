import { type User, type InsertUser, type Rubric, type InsertRubric } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getRubric(id: string): Promise<Rubric | undefined>;
  getAllRubrics(): Promise<Rubric[]>;
  createRubric(rubric: InsertRubric): Promise<Rubric>;
  updateRubric(id: string, rubric: Partial<Rubric>): Promise<Rubric | undefined>;
  deleteRubric(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rubrics: Map<string, Rubric>;

  constructor() {
    this.users = new Map();
    this.rubrics = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      email: insertUser.email,
      password_hash: insertUser.password_hash,
      username: insertUser.username ?? null,
      name: insertUser.name ?? null,
      role: insertUser.role ?? "user",
      created_at: now,
      updated_at: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getRubric(id: string): Promise<Rubric | undefined> {
    return this.rubrics.get(id);
  }

  async getAllRubrics(): Promise<Rubric[]> {
    return Array.from(this.rubrics.values());
  }

  async createRubric(insertRubric: InsertRubric): Promise<Rubric> {
    const id = randomUUID();
    const now = new Date();
    const rubric: Rubric = {
      id,
      user_id: insertRubric.user_id ?? null,
      name: insertRubric.name,
      description: insertRubric.description ?? null,
      rubric_summary: insertRubric.rubric_summary ?? null,
      rubric_type: insertRubric.rubric_type,
      academic_level: insertRubric.academic_level,
      total_points: insertRubric.total_points ?? 100,
      minimum_word_count: insertRubric.minimum_word_count ?? null,
      time_limit_minutes: insertRubric.time_limit_minutes ?? null,
      late_policy_enabled: insertRubric.late_policy_enabled ?? true,
      revision_policy_enabled: insertRubric.revision_policy_enabled ?? true,
      is_template: insertRubric.is_template ?? false,
      created_at: now,
      updated_at: now,
    };
    this.rubrics.set(id, rubric);
    return rubric;
  }

  async updateRubric(id: string, updates: Partial<Rubric>): Promise<Rubric | undefined> {
    const existing = this.rubrics.get(id);
    if (!existing) return undefined;
    
    const updated: Rubric = { ...existing, ...updates, id };
    this.rubrics.set(id, updated);
    return updated;
  }

  async deleteRubric(id: string): Promise<boolean> {
    return this.rubrics.delete(id);
  }
}

export const storage = new MemStorage();
