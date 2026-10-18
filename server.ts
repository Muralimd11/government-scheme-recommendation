import dns from "dns";

dns.setServers(["8.8.8.8"]);

import "dotenv/config";
import { createApp } from "./backend/app";
import { connectDB } from "./backend/config/db";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";




const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;



async function startServer() {
  console.log("[Server] Initializing Tamil Nadu Farmer Scheme Recommendation System...");

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create sample dummy PDF files for seeded document references if not present
  const sampleFiles = ["sample_patta.pdf", "sample_aadhaar.pdf", "sample_adangal.pdf"];
  for (const f of sampleFiles) {
    const fPath = path.join(uploadsDir, f);
    if (!fs.existsSync(fPath)) {
      fs.writeFileSync(fPath, "%PDF-1.4 Mock Government Document for Verification Demo\n%%EOF");
    }
  }

  // Initialize Database (MongoMemoryServer or external Mongo)
  await connectDB();

  // Create Express App
  const app = createApp();

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite middleware in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] TN Farmer Schemes Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Fatal error on startup:", err);
  process.exit(1);
});
