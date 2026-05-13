import { db } from "./db";
import {
  experiments,
  type Experiment,
  type InsertExperiment,
} from "@shared/schema";

class MemoryStorage implements IStorage {
  private items: Experiment[] = [];
  private idSeq = 1;

  async getExperiments(): Promise<Experiment[]> {
    return this.items;
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const exp = {
      id: this.idSeq++,
      ...insertExperiment,
    } as Experiment;
    this.items = [...this.items, exp];
    return exp;
  }
}

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

class SafeDatabaseStorage implements IStorage {
  private dbStorage = new DatabaseStorage();
  private memoryStorage = new MemoryStorage();
  private dbFailed = false;

  async getExperiments(): Promise<Experiment[]> {
    if (this.dbFailed) return this.memoryStorage.getExperiments();
    try {
      return await this.dbStorage.getExperiments();
    } catch {
      this.dbFailed = true;
      return this.memoryStorage.getExperiments();
    }
  }

  async createExperiment(experiment: InsertExperiment): Promise<Experiment> {
    if (this.dbFailed) return this.memoryStorage.createExperiment(experiment);
    try {
      return await this.dbStorage.createExperiment(experiment);
    } catch {
      this.dbFailed = true;
      return this.memoryStorage.createExperiment(experiment);
    }
  }
}

export const storage = new SafeDatabaseStorage();
