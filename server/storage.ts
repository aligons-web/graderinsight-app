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
    const user: User = { ...insertUser, id };
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
    const rubric: Rubric = { ...insertRubric, id };
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
