import type { Connection, InsertConnection } from "@shared/schema";

export async function createConnection(data: Partial<InsertConnection>): Promise<Connection> {
  const response = await fetch("/api/connections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create connection");
  }
  
  return response.json();
}

export async function updateConnection(id: string, data: Partial<InsertConnection>): Promise<Connection> {
  const response = await fetch(`/api/connections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update connection");
  }
  
  return response.json();
}

export async function getConnection(id: string): Promise<Connection> {
  const response = await fetch(`/api/connections/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch connection");
  }
  
  return response.json();
}

export async function getAllConnections(): Promise<Connection[]> {
  const response = await fetch("/api/connections");
  
  if (!response.ok) {
    throw new Error("Failed to fetch connections");
  }
  
  return response.json();
}
