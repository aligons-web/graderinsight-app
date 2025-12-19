import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRubricSchema, rubricSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/rubrics", async (req, res) => {
    try {
      const rubrics = await storage.getAllRubrics();
      res.json(rubrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rubrics" });
    }
  });

  app.get("/api/rubrics/:id", async (req, res) => {
    try {
      const rubric = await storage.getRubric(req.params.id);
      if (!rubric) {
        return res.status(404).json({ error: "Rubric not found" });
      }
      res.json(rubric);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rubric" });
    }
  });

  app.post("/api/rubrics", async (req, res) => {
    try {
      const parsed = insertRubricSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid rubric data", details: parsed.error.errors });
      }
      
      const rubric = await storage.createRubric(parsed.data);
      res.status(201).json(rubric);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rubric" });
    }
  });

  app.put("/api/rubrics/:id", async (req, res) => {
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
      res.status(500).json({ error: "Failed to update rubric" });
    }
  });

  app.delete("/api/rubrics/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRubric(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rubric not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rubric" });
    }
  });

  return httpServer;
}
