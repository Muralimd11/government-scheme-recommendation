import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedDatabase } from "../utils/seedData";

let mongodInstance: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      console.log("[Database] Connecting to external MongoDB:", mongoUri);
      await mongoose.connect(mongoUri);
      console.log("[Database] Connected to external MongoDB successfully.");
    } else {
      console.log("[Database] No MONGO_URI provided. Initializing in-memory MongoDB instance...");
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: "tnschemes_db",
        }
      });
      const uri = mongodInstance.getUri();
      console.log("[Database] In-memory MongoDB running at:", uri);
      await mongoose.connect(uri);
      console.log("[Database] Mongoose connected to in-memory MongoDB.");
    }

    // Seed initial government schemes, admin, sample farmers and applications
    await seedDatabase();
  } catch (error) {
    console.error("[Database] Failed to connect to MongoDB:", error);
    // Don't crash immediately so app can provide informative error response
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error("[Database] Error disconnecting:", err);
  }
}
