import dns from "dns";
dns.setServers(["8.8.8.8"]);
import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Scheme } from "../backend/models/Scheme";

interface ImportSummary {
  dryRun: boolean;
  totalCatalogueRecords: number;
  inserted: number;
  updated: number;
  skipped: number;
  flaggedRequiresVerification: number;
  skippedReasons: Array<{ schemeId: string; reason: string }>;
}

async function runImport() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`\n================ MONGODB SCHEME CATALOGUE IMPORTER ================\n`);
  console.log(`Mode: ${isDryRun ? "DRY-RUN (No database modifications will be committed)" : "LIVE IMPORT"}`);

  const jsonPath = path.join(process.cwd(), "ml", "catalogue", "validated_schemes.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`[Error] Validated catalogue file not found at: ${jsonPath}`);
    console.error(`Please run 'python ml/catalogue/validate_catalogue.py' first.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const records: any[] = JSON.parse(rawData);
  console.log(`Loaded ${records.length} records from validated catalogue.\n`);

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("[Error] MONGO_URI is not set in environment or .env file.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`Connected successfully to database: ${mongoose.connection.name || "MongoDB Atlas"}`);

  const summary: ImportSummary = {
    dryRun: isDryRun,
    totalCatalogueRecords: records.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    flaggedRequiresVerification: 0,
    skippedReasons: []
  };

  const seenIds = new Set<string>();

  // Pre-fetch all existing scheme IDs in a single query for speed
  const existingSchemes = await Scheme.find({}, { schemeId: 1 }).lean();
  const existingIdSet = new Set<string>();
  for (const s of existingSchemes) {
    if (s.schemeId) {
      existingIdSet.add(s.schemeId);
      existingIdSet.add(s.schemeId.toLowerCase());
      existingIdSet.add(s.schemeId.toUpperCase());
    }
  }

  const bulkOps: any[] = [];

  for (const record of records) {
    const sid = record.schemeId;

    if (!sid || typeof sid !== "string" || sid.trim() === "") {
      summary.skipped++;
      summary.skippedReasons.push({ schemeId: sid || "EMPTY", reason: "Missing or invalid scheme_id." });
      continue;
    }

    if (seenIds.has(sid)) {
      summary.skipped++;
      summary.skippedReasons.push({ schemeId: sid, reason: "Duplicate scheme_id within incoming catalogue payload." });
      continue;
    }
    seenIds.add(sid);

    if (record.schemeStatus === "Requires verification" || record.verificationStatus?.includes("not independently verified")) {
      summary.flaggedRequiresVerification++;
    }

    const isExisting = existingIdSet.has(sid) || existingIdSet.has(sid.toLowerCase()) || existingIdSet.has(sid.toUpperCase());

    if (isExisting) {
      summary.updated++;
    } else {
      summary.inserted++;
    }

    if (!isDryRun) {
      bulkOps.push({
        updateOne: {
          filter: {
            $or: [
              { schemeId: sid },
              { schemeId: sid.toUpperCase() },
              { schemeId: sid.toLowerCase() }
            ]
          },
          update: { $set: record },
          upsert: true
        }
      });
    }
  }

  if (!isDryRun && bulkOps.length > 0) {
    console.log(`Executing ${bulkOps.length} bulk upsert operations to MongoDB...`);
    await Scheme.bulkWrite(bulkOps, { ordered: false });
  }

  console.log("\n================ IMPORT EXECUTION SUMMARY ================");
  console.log(`Execution Mode                 : ${isDryRun ? "DRY-RUN (Simulated)" : "LIVE DATABASE UPDATE"}`);
  console.log(`Total Incoming Schemes         : ${summary.totalCatalogueRecords}`);
  console.log(`Schemes Inserted (New)         : ${summary.inserted}`);
  console.log(`Schemes Updated (Existing)     : ${summary.updated}`);
  console.log(`Schemes Skipped (Invalid/Dup)  : ${summary.skipped}`);
  console.log(`Flagged 'Requires Verification': ${summary.flaggedRequiresVerification}`);
  if (summary.skippedReasons.length > 0) {
    console.log(`Skipped details:`, summary.skippedReasons);
  }

  const currentTotalInDb = await Scheme.countDocuments();
  console.log(`Current Total Schemes in Mongo : ${currentTotalInDb}`);
  console.log("==========================================================\n");

  await mongoose.disconnect();
}

runImport().catch((err) => {
  console.error("[Importer Error]:", err);
  process.exit(1);
});
