import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { connections, type Connection, type InsertConnection } from "@shared/schema";
import { eq } from "drizzle-orm";

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

const db = drizzle(pool);

export interface IStorage {
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: string): Promise<Connection | undefined>;
  getAllConnections(): Promise<Connection[]>;
  updateConnection(id: string, updates: Partial<InsertConnection>): Promise<Connection | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db.insert(connections).values(insertConnection).returning();
    return connection;
  }

  async getConnection(id: string): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection;
  }

  async getAllConnections(): Promise<Connection[]> {
    return await db.select().from(connections);
  }

  async updateConnection(id: string, updates: Partial<InsertConnection>): Promise<Connection | undefined> {
    const [connection] = await db
      .update(connections)
      .set(updates)
      .where(eq(connections.id, id))
      .returning();
    return connection;
  }
}

export const storage = new DatabaseStorage();
