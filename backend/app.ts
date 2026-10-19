import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import authRoutes from "./routes/authRoutes";
import farmerRoutes from "./routes/farmerRoutes";
import schemeRoutes from "./routes/schemeRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import documentRoutes from "./routes/documentRoutes";
import adminRoutes from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import translateRoutes from "./routes/translateRoutes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  // Security & utility middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Static uploads directory for document previews
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Tamil Nadu Farmer Government Scheme Recommendation API",
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/farmers", farmerRoutes);
  app.use("/api/schemes", schemeRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/translate", translateRoutes);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
