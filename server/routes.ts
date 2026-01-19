import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.experiments.list.path, async (req, res) => {
    const experiments = await storage.getExperiments();
    res.json(experiments);
  });

  app.post(api.experiments.create.path, async (req, res) => {
    try {
      const input = api.experiments.create.input.parse(req.body);
      const experiment = await storage.createExperiment(input);
      res.status(201).json(experiment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      throw err;
    }
  });

  return httpServer;
}
