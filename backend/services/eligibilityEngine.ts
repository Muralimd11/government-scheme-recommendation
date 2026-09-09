import { Scheme, IScheme } from "../models/Scheme";
import { runMLPrediction, MLPredictionResult } from "./mlService";

export interface EligibilityEvaluationResult {
  isEligible: boolean;
  reasons: string[];
}

export interface RecommendationOutput {
  schemeId: string;
  schemeName: string;
  schemeNameTamil?: string;
  matchScore: number;
  whyRecommended: string[];
  governmentLevel: string;
  department: string;
  category: string;
  benefits: string;
  benefitsTamil?: string;
  description: string;
  requiredDocuments: string[];
  officialWebsite: string;
  applicationUrl: string;
  applicationDeadline: string;
  isDemonstrationData: boolean;
}

export function evaluateSchemeEligibility(scheme: IScheme, farmer: Record<string, any>): EligibilityEvaluationResult {
  const reasons: string[] = [];

  const age = Number(farmer.age) || 45;
  const income = Number(farmer.annualIncome ?? farmer.income) || 0;
  const land = Number(farmer.landSize) || 0;
  const district = String(farmer.district || "").trim();
  const crop = String(farmer.cropType || "").trim();
  const farmerType = String(farmer.farmerType || "").trim();
  const irrigation = String(farmer.irrigationType || "").trim();
  const social = String(farmer.socialCategory || "").trim();
  const livestock = Boolean(farmer.livestockOwnership ?? farmer.livestock);
  const horticulture = Boolean(farmer.horticultureActivity ?? farmer.horticulture);
  const machinery = Boolean(farmer.machineryOwnership ?? farmer.machinery);

  // 1. Age check
  if (scheme.minimumAge && age < scheme.minimumAge) {
    return { isEligible: false, reasons: [] };
  }
  if (scheme.maximumAge && age > scheme.maximumAge) {
    return { isEligible: false, reasons: [] };
  }

  // 2. Income limit
  if (scheme.incomeLimit !== null && scheme.incomeLimit !== undefined && scheme.incomeLimit > 0) {
    if (income > scheme.incomeLimit) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Annual income (₹${income.toLocaleString("en-IN")}) is within the ceiling of ₹${scheme.incomeLimit.toLocaleString("en-IN")}`);
  }

  // 3. Landholding requirements
  if (scheme.landholdingMin > 0 && land < scheme.landholdingMin) {
    return { isEligible: false, reasons: [] };
  }
  if (scheme.landholdingMax < 900 && land > scheme.landholdingMax) {
    return { isEligible: false, reasons: [] };
  }
  if (land > 0) {
    reasons.push(`Holding of ${land} acres meets the ${scheme.landholdingMin > 0 ? `${scheme.landholdingMin}-` : ""}${scheme.landholdingMax < 900 ? `${scheme.landholdingMax} acre` : ""} land requirement`);
  }

  // 4. District check
  if (scheme.applicableDistricts && scheme.applicableDistricts.length > 0 && !scheme.applicableDistricts.includes("All")) {
    if (!scheme.applicableDistricts.some((d) => d.toLowerCase() === district.toLowerCase())) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Valid in designated district: ${district}`);
  }

  // 5. Crop type check
  if (scheme.cropTypes && scheme.cropTypes.length > 0 && !scheme.cropTypes.includes("All")) {
    if (!scheme.cropTypes.some((c) => c.toLowerCase() === crop.toLowerCase())) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Applicable for active crop: ${crop}`);
  }

  // 6. Farmer type check
  if (scheme.applicableFarmerTypes && scheme.applicableFarmerTypes.length > 0 && !scheme.applicableFarmerTypes.includes("All")) {
    if (!scheme.applicableFarmerTypes.some((f) => f.toLowerCase() === farmerType.toLowerCase())) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Category matches: ${farmerType} farmer`);
  }

  // 7. Irrigation check
  if (scheme.irrigationRequirements && scheme.irrigationRequirements.length > 0 && !scheme.irrigationRequirements.includes("All")) {
    if (!scheme.irrigationRequirements.some((i) => i.toLowerCase() === irrigation.toLowerCase())) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Compatible with your irrigation source: ${irrigation}`);
  }

  // 8. Social Category
  if (scheme.socialCategory && scheme.socialCategory.length > 0 && !scheme.socialCategory.includes("All")) {
    if (!scheme.socialCategory.some((s) => s.toLowerCase() === social.toLowerCase())) {
      return { isEligible: false, reasons: [] };
    }
    reasons.push(`Category prioritized under social welfare guidelines: ${social}`);
  }

  // 9. Specific requirements
  if (scheme.livestockRequirement && !livestock) {
    return { isEligible: false, reasons: [] };
  } else if (scheme.livestockRequirement && livestock) {
    reasons.push("Farmer owns livestock / dairy cattle");
  }

  if (scheme.horticultureRequirement && !horticulture) {
    return { isEligible: false, reasons: [] };
  } else if (scheme.horticultureRequirement && horticulture) {
    reasons.push("Engaged in horticulture / vegetable / flower cultivation");
  }

  if (scheme.machineryRequirement && !machinery && land < 2.5) {
    return { isEligible: false, reasons: [] };
  }

  return { isEligible: true, reasons };
}

export async function getRecommendationsForFarmer(farmerProfile: Record<string, any>): Promise<RecommendationOutput[]> {
  // Step 1: Query all active schemes
  const allSchemes = await Scheme.find({ status: "ACTIVE" });

  // Step 2: Rule-based eligibility filtering
  const eligibleSchemes: { scheme: IScheme; ruleReasons: string[] }[] = [];

  for (const scheme of allSchemes) {
    const evaluation = evaluateSchemeEligibility(scheme, farmerProfile);
    if (evaluation.isEligible) {
      eligibleSchemes.push({
        scheme,
        ruleReasons: evaluation.reasons
      });
    }
  }

  if (eligibleSchemes.length === 0) {
    return [];
  }

  // Step 3: Run Random Forest Model on the farmer features
  const mlPredictions: MLPredictionResult[] = await runMLPrediction(farmerProfile);
  const mlScoreMap = new Map<string, number>();
  for (const p of mlPredictions) {
    mlScoreMap.set(p.schemeId, p.probability);
  }

  // Step 4: Rank and compute combined match score (scale 70% - 98%)
  const maxMlProb = Math.max(...Array.from(mlScoreMap.values()), 0.05);

  const results: RecommendationOutput[] = eligibleSchemes.map(({ scheme, ruleReasons }) => {
    const mlProb = mlScoreMap.get(scheme.schemeId) || 0.05;
    const normalizedMl = mlProb / maxMlProb; // 0 to 1

    // Baseline match: Rule passed gives 72% base, ML confidence adds up to 26%
    const calculatedScore = Math.min(98, Math.round(72 + normalizedMl * 24 + (ruleReasons.length * 1.5)));

    // Ensure reasons are rich and farmer friendly
    const whyRecommended = [...ruleReasons];
    if (mlProb > 0.15) {
      whyRecommended.push("High statistical suitability match from Random Forest profile analysis");
    }
    if (whyRecommended.length === 0) {
      whyRecommended.push("General state agricultural welfare eligibility");
    }

    return {
      schemeId: scheme.schemeId,
      schemeName: scheme.schemeName,
      schemeNameTamil: scheme.schemeNameTamil,
      matchScore: calculatedScore,
      whyRecommended,
      governmentLevel: scheme.governmentLevel,
      department: scheme.department,
      category: scheme.category,
      benefits: scheme.benefits,
      benefitsTamil: scheme.benefitsTamil,
      description: scheme.description,
      requiredDocuments: scheme.requiredDocuments,
      officialWebsite: scheme.officialWebsite,
      applicationUrl: scheme.applicationUrl,
      applicationDeadline: scheme.applicationDeadline,
      isDemonstrationData: scheme.isDemonstrationData
    };
  });

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}
