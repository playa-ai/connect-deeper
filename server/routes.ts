import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConnectionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { analyzeAudio, generatePosterImage, generateFollowUp } from "./analyze";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create a new connection
  app.post("/api/connections", async (req, res) => {
    try {
      const validatedData = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(validatedData);
      res.status(201).json(connection);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating connection:", error);
      res.status(500).json({ error: "Failed to create connection" });
    }
  });

  // Update an existing connection (for incrementally adding data)
  app.patch("/api/connections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Auto-set consent timestamp when guest consents
      if (updates.guestConsented === true && !updates.consentTimestamp) {
        updates.consentTimestamp = new Date();
      }
      
      const connection = await storage.updateConnection(id, updates);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ error: "Failed to update connection" });
    }
  });

  // Get a specific connection
  app.get("/api/connections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Error fetching connection:", error);
      res.status(500).json({ error: "Failed to fetch connection" });
    }
  });

  // Get all connections (for admin/analytics)
  app.get("/api/connections", async (req, res) => {
    try {
      const allConnections = await storage.getAllConnections();
      res.json(allConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  // Analyze audio and generate insights
  app.post("/api/connections/:id/analyze", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      
      if (!connection.audioData) {
        return res.status(400).json({ error: "No audio data to analyze" });
      }

      const { transcript, intentionSummary, insights, posterPrompt } = await analyzeAudio(
        connection.audioData,
        connection.intentionText,
        connection.questionsAsked || []
      );

      const updatedConnection = await storage.updateConnection(id, {
        transcript,
        intentionSummary,
        aiInsights: insights,
        posterPrompt,
      });

      res.json({
        transcript,
        intentionSummary,
        insights,
        posterPrompt,
        connection: updatedConnection,
      });
    } catch (error) {
      console.error("Error analyzing audio:", error);
      res.status(500).json({ error: "Failed to analyze audio" });
    }
  });

  // Generate poster image
  app.post("/api/connections/:id/poster", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      
      if (!connection.posterPrompt) {
        return res.status(400).json({ error: "No poster prompt available. Run analysis first." });
      }

      const posterImageUrl = await generatePosterImage(connection.posterPrompt);

      const updatedConnection = await storage.updateConnection(id, {
        posterImageUrl,
      });

      res.json({
        posterImageUrl,
        connection: updatedConnection,
      });
    } catch (error) {
      console.error("Error generating poster:", error);
      res.status(500).json({ error: "Failed to generate poster" });
    }
  });

  // Generate follow-up suggestions
  app.post("/api/connections/:id/followup", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await storage.getConnection(id);
      
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      
      if (!connection.transcript) {
        return res.status(400).json({ error: "No transcript available. Run analysis first." });
      }

      const followUp = await generateFollowUp(
        connection.intentionSummary || connection.intentionText,
        connection.transcript,
        connection.aiInsights || ""
      );

      res.json(followUp);
    } catch (error) {
      console.error("Error generating follow-up:", error);
      res.status(500).json({ error: "Failed to generate follow-up suggestions" });
    }
  });

  return httpServer;
}
