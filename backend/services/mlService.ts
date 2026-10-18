import { spawn } from "child_process";
import path from "path";

export interface MLPredictionResult {
  schemeId: string;
  probability: number;
  confidenceRate?: string;
  confidenceScore?: number;
}

function getPythonCommand(): string {
  if (process.env.PYTHON_PATH) {
    return process.env.PYTHON_PATH;
  }
  return process.platform === "win32" ? "python" : "python3";
}

export async function runMLPrediction(farmerData: Record<string, any>): Promise<MLPredictionResult[]> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.join(process.cwd(), "ml", "predict.py");
      const pythonCmd = getPythonCommand();
      const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(farmerData)]);

      let stdoutData = "";
      let stderrData = "";

      const timer = setTimeout(() => {
        pythonProcess.kill();
        console.warn("[ML Service] Python process timed out after 8s. Using statistical fallback.");
        resolve(fallbackPrediction(farmerData));
      }, 8000);

      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          console.warn(`[ML Service] Python exited with code ${code}. Stderr: ${stderrData}`);
          return resolve(fallbackPrediction(farmerData));
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (parsed && parsed.success) {
            if (Array.isArray(parsed.predictions) && parsed.predictions.length > 0) {
              return resolve(parsed.predictions);
            }
            if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
              return resolve(
                parsed.recommendations.map((r: any) => ({
                  schemeId: r.schemeId,
                  probability: (Number(r.matchScore) || 75) / 100,
                  confidenceRate: `${r.matchScore || 75}%`,
                  confidenceScore: r.matchScore || 75
                }))
              );
            }
          }
          resolve(fallbackPrediction(farmerData));
        } catch (e) {
          console.warn("[ML Service] Failed to parse Python stdout. Fallback active.", e);
          resolve(fallbackPrediction(farmerData));
        }
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timer);
        console.warn(`[ML Service] Failed to spawn '${pythonCmd}':`, err.message);
        resolve(fallbackPrediction(farmerData));
      });
    } catch (err) {
      console.warn("[ML Service] Exception during ML prediction:", err);
      resolve(fallbackPrediction(farmerData));
    }
  });
}

function fallbackPrediction(data: Record<string, any>): MLPredictionResult[] {
  // Analytical decision-tree scoring based on the calibrated model features
  const crop = (data.cropType || data.primaryCrop || "").toLowerCase();
  const district = (data.district || "").toLowerCase();
  const land = Number(data.landSize) || 2.0;
  const income = Number(data.income || data.annualIncome) || 120000;
  const irrigation = (data.irrigationType || data.irrigationSource || "").toLowerCase();
  const livestock = String(data.livestock || data.livestockOwnership).toLowerCase() === "true" || String(data.livestock) === "yes";
  const horticulture = String(data.horticulture || data.horticultureActivity).toLowerCase() === "true" || String(data.horticulture) === "yes";
  const machinery = String(data.machinery || data.machineryOwnership).toLowerCase() === "true" || String(data.machinery) === "yes";

  const scores: Record<string, number> = {
    // New Meaningful IDs
    "TN-AGRI-PM-KISAN": land <= 5.0 && income <= 250000 ? 0.42 : 0.08,
    "TN-IRRIG-FREE-ELEC": irrigation.includes("well") || irrigation.includes("bore") ? 0.38 : 0.08,
    "TN-IRRIG-PMKSY-MI": horticulture || ["drip", "sprinkler"].includes(irrigation) ? 0.45 : 0.12,
    "TN-AGRI-KAVIADP": land <= 5.0 ? 0.35 : 0.06,
    "TN-AGRI-KURUVAI-PKG": ["thanjavur", "tiruvarur", "nagapattinam", "cuddalore", "mayiladuthurai"].includes(district) && crop.includes("paddy") ? 0.48 : 0.02,
    "TN-AGRI-SMAM": machinery || land >= 2.5 ? 0.40 : 0.08,
    "TN-HORT-MIDH": horticulture || ["vegetables", "flowers", "banana", "coconut", "mango"].includes(crop) ? 0.46 : 0.05,
    "TN-INS-PMFBY": ["paddy", "cotton", "groundnut", "sugarcane", "maize"].includes(crop) ? 0.38 : 0.09,
    "TN-IRRIG-SOLAR-PUMP": land <= 5.0 && (irrigation.includes("bore") || irrigation.includes("well")) ? 0.41 : 0.05,
    "TN-AGRI-TCPL-TN": land >= 1.0 ? 0.28 : 0.08,
    "TN-ANIMAL-DAIRY-DEV": livestock && income <= 150000 ? 0.48 : 0.04,
    "TN-HLTH-SOIL-HEALTH": 0.32,
    "TN-FIN-KCC": 0.36,
    "TN-INS-COCONUT-INS": crop.includes("coconut") ? 0.50 : 0.05,
    "TN-ANIMAL-ANIMAL-HUSB": livestock ? 0.44 : 0.06,
    "TN-IRRIG-ATAL-BHUJAL": 0.30,
    "TN-ENTR-AC-ABC": 0.28,
    "TN-ENTR-KHADI-VIKAS": 0.26,
    "TN-INS-AABY": income <= 150000 ? 0.35 : 0.08,

    // Legacy Aliases
    "TN-SCH-01": land <= 5.0 && income <= 250000 ? 0.42 : 0.08,
    "TN-SCH-02": irrigation.includes("well") || irrigation.includes("bore") ? 0.38 : 0.08,
    "TN-SCH-03": horticulture || ["drip", "sprinkler"].includes(irrigation) ? 0.45 : 0.12,
    "TN-SCH-04": land <= 5.0 ? 0.35 : 0.06,
    "TN-SCH-05": ["thanjavur", "tiruvarur", "nagapattinam", "cuddalore", "mayiladuthurai"].includes(district) && crop.includes("paddy") ? 0.48 : 0.02,
    "TN-SCH-06": machinery || land >= 2.5 ? 0.40 : 0.08,
    "TN-SCH-07": horticulture || ["vegetables", "flowers", "banana", "coconut"].includes(crop) ? 0.46 : 0.05,
    "TN-SCH-08": ["paddy", "cotton", "groundnut", "sugarcane"].includes(crop) ? 0.38 : 0.09,
    "TN-SCH-09": land <= 5.0 && (irrigation.includes("bore") || irrigation.includes("well")) ? 0.41 : 0.05,
    "TN-SCH-10": land >= 1.0 ? 0.28 : 0.08,
    "TN-SCH-11": livestock && income <= 150000 ? 0.48 : 0.04,
    "TN-SCH-12": 0.32
  };

  const results: MLPredictionResult[] = Object.entries(scores).map(([schemeId, probability]) => {
    const rounded = Math.round(probability * 1000) / 1000;
    return {
      schemeId,
      probability: rounded,
      confidenceRate: `${(rounded * 100).toFixed(1)}%`,
      confidenceScore: Math.round(rounded * 100)
    };
  });

  results.sort((a, b) => b.probability - a.probability);
  return results;
}

