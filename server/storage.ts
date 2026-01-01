import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { connections, type Connection, type InsertConnection } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const isProduction = process.env.NODE_ENV === "production";
const isDeployment = process.env.REPLIT_DEPLOYMENT === "1";
const databaseUrl = process.env.DATABASE_URL;

const INTERNAL_HOSTS = ["helium", "localhost", "127.0.0.1"];

let dbHost = "";
let useInMemory = false;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set! Using in-memory storage.");
  useInMemory = true;
} else {
  try {
    dbHost = new URL(databaseUrl).hostname;
    console.log(`Database connection: host=${dbHost}, production=${isProduction}, deployment=${isDeployment}`);
    
    const isInternalHost = INTERNAL_HOSTS.includes(dbHost);
    
    if ((isProduction || isDeployment) && isInternalHost) {
      console.warn("===========================================");
      console.warn("WARNING: Production/deployment using internal hostname!");
      console.warn("Falling back to IN-MEMORY storage.");
      console.warn("Data will NOT persist across restarts!");
      console.warn("To fix: Configure production DATABASE_URL in Deploy settings.");
      console.warn("===========================================");
      useInMemory = true;
    }
  } catch (e) {
    console.error("Invalid DATABASE_URL format - using in-memory storage");
    useInMemory = true;
  }
}

let pool: pkg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (!useInMemory && databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: (isProduction || isDeployment) ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
  });

  pool.on("connect", () => {
    console.log("Database pool connected successfully");
  });

  db = drizzle(pool);
}

export interface IStorage {
  createConnection(connection: InsertConnection): Promise<Connection>;
  getConnection(id: string): Promise<Connection | undefined>;
  getAllConnections(): Promise<Connection[]>;
  updateConnection(id: string, updates: Partial<InsertConnection>): Promise<Connection | undefined>;
}

const inMemoryStore = new Map<string, Connection>();

export class InMemoryStorage implements IStorage {
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const connection: Connection = {
      id: randomUUID(),
      hostId: insertConnection.hostId,
      intentionText: insertConnection.intentionText,
      intentionCapturedAt: new Date(),
      guestEmail: insertConnection.guestEmail || null,
      hostEmail: insertConnection.hostEmail || null,
      createdAt: new Date(),
      locationLat: insertConnection.locationLat || null,
      locationLng: insertConnection.locationLng || null,
      vibeDepth: insertConnection.vibeDepth ?? 50,
      guestConsented: insertConnection.guestConsented ?? false,
      consentTimestamp: insertConnection.consentTimestamp || null,
      audioData: insertConnection.audioData || null,
      audioDurationSeconds: insertConnection.audioDurationSeconds || null,
      questionsAsked: insertConnection.questionsAsked || null,
      npsScore: insertConnection.npsScore || null,
      feedbackText: insertConnection.feedbackText || null,
      reminderSent: false,
      reminderSentAt: null,
      transcript: insertConnection.transcript || null,
      aiInsights: insertConnection.aiInsights || null,
      posterPrompt: insertConnection.posterPrompt || null,
      posterImageUrl: insertConnection.posterImageUrl || null,
    };
    inMemoryStore.set(connection.id, connection);
    console.log(`InMemory: Created connection ${connection.id}`);
    return connection;
  }

  async getConnection(id: string): Promise<Connection | undefined> {
    return inMemoryStore.get(id);
  }

  async getAllConnections(): Promise<Connection[]> {
    return Array.from(inMemoryStore.values());
  }

  async updateConnection(id: string, updates: Partial<InsertConnection>): Promise<Connection | undefined> {
    const existing = inMemoryStore.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates } as Connection;
    inMemoryStore.set(id, updated);
    console.log(`InMemory: Updated connection ${id}`);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    if (!db) throw new Error("Database not initialized");
    const [connection] = await db.insert(connections).values(insertConnection).returning();
    return connection;
  }

  async getConnection(id: string): Promise<Connection | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection;
  }

  async getAllConnections(): Promise<Connection[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(connections);
  }

  async updateConnection(id: string, updates: Partial<InsertConnection>): Promise<Connection | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [connection] = await db
      .update(connections)
      .set(updates)
      .where(eq(connections.id, id))
      .returning();
    return connection;
  }
}

export const storage: IStorage = useInMemory ? new InMemoryStorage() : new DatabaseStorage();

if (useInMemory) {
  console.log("Using IN-MEMORY storage (data will not persist across restarts)");
} else {
  console.log("Using PostgreSQL database storage");
}
