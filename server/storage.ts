import { db } from "./db";
import {
  experiments,
  type Experiment,
  type InsertExperiment,
} from "@shared/schema";

export interface IStorage {
  getExperiments(): Promise<Experiment[]>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
}

export class DatabaseStorage implements IStorage {
  async getExperiments(): Promise<Experiment[]> {
    return await db.select().from(experiments);
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const [experiment] = await db
      .insert(experiments)
      .values(insertExperiment)
      .returning();
    return experiment;
  }
}

export const storage = new DatabaseStorage();
