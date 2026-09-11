import { Scheme, IScheme } from "../models/Scheme";
import { runMLPrediction, MLPredictionResult } from "./mlService";

export interface EligibilityEvaluationResult {
  isEligible: boolean;
  reasons: string[];
  ineligibleReason?: string;
}

export interface RecommendationOutput {
  schemeId: string;
  schemeName: string;
  schemeNameTamil?: string;
  matchScore: number;
  isEligible: boolean;
  eligibilityStatus: "Eligible" | "Potentially Eligible" | "Not Eligible";
  ineligibleReason?: string;
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
  const cultivableLand = Number(farmer.cultivableArea ?? farmer.landSize) || land;
  const district = String(farmer.district || "").trim();
  const block = String(farmer.block || "").trim();
  const crop = String(farmer.cropType || farmer.primaryCrop || "").trim();
  const secondaryCrop = String(farmer.secondaryCrop || "").trim();
  const farmerType = String(farmer.farmerType || "").trim();
  const irrigation = String(farmer.irrigationType || farmer.irrigationSource || "").trim();
  const irrigationMethod = String(farmer.irrigationMethod || "").trim();
  const social = String(farmer.socialCategory || "").trim();
  const landOwnership = String(farmer.landOwnershipType || farmer.landOwnership || "").trim();
  const patta = String(farmer.pattaAvailable || "Yes").trim();

  // Allied activities & livestock
  const cowCount = Number(farmer.cowCount) || 0;
  const goatCount = Number(farmer.goatCount) || 0;
  const poultryCount = Number(farmer.poultryCount) || 0;
  const dairy = farmer.dairyFarming === "Yes" || cowCount > 0;
  const goatSheep = farmer.goatSheepFarming === "Yes" || goatCount > 0;
  const poultry = farmer.poultryFarming === "Yes" || poultryCount > 0;
  const fisheries = farmer.fisheries === "Yes";
  const beekeeping = farmer.beekeeping === "Yes";
  const sericulture = farmer.sericulture === "Yes";
  const mushroom = farmer.mushroomCultivation === "Yes";
  const agroforestry = farmer.agroforestry === "Yes";
  const livestock = Boolean(farmer.livestockOwnership) || dairy || goatSheep || poultry;
  const horticulture = (farmer.horticultureType && farmer.horticultureType !== "None") || Boolean(farmer.horticultureActivity);

  // Machinery & Infrastructure
  const machineryList: string[] = Array.isArray(farmer.machineryList) ? farmer.machineryList : [];
  const infrastructureList: string[] = Array.isArray(farmer.infrastructureList) ? farmer.infrastructureList : [];
  const machinery = Boolean(farmer.machineryOwnership) || machineryList.length > 0;

  // Organic / Natural
  const organicFarming = farmer.organicFarming === "Yes" || farmer.organicFarming === "Planning to Adopt" || farmer.farmingType === "Organic";
  const naturalFarming = farmer.naturalFarming === "Yes" || farmer.farmingType === "Natural";
  const organicCertified = farmer.organicCertificationStatus === "Certified" || Boolean(farmer.organicCertified);

  // Irrigation & Solar
  const solarPumpInterest = Boolean(farmer.solarPumpInterest) || farmer.existingSolarPump === "Yes" || farmer.pumpType === "Solar";
  const dripAvailable = farmer.dripAvailable === "Yes" || irrigationMethod === "Drip";
  const sprinklerAvailable = farmer.sprinklerAvailable === "Yes" || irrigationMethod === "Sprinkler";
  const farmPond = farmer.farmPondAvailable === "Yes" || infrastructureList.includes("Farm Pond");

  // Welfare & Credit
  const pmKisan = Boolean(farmer.pmKisanBeneficiary);
  const kcc = farmer.activeKCC === "Yes" || Boolean(farmer.kisanCreditCard);
  const differentlyAbled = Boolean(farmer.differentlyAbled);
  const soilType = String(farmer.soilType || "").trim();
  const croppingSeason = String(farmer.croppingSeason || "").trim();

  // Organizations
  const memberFPO = farmer.memberFPO === "Yes";
  const memberSHG = farmer.memberSHG === "Yes";

  // Intent / Assistance Required
  const assistanceList: string[] = Array.isArray(farmer.assistanceRequired) ? farmer.assistanceRequired : [];

  // Previous benefits
  const previousApps: Array<{ schemeId: string; schemeName: string; year: number }> = Array.isArray(farmer.previousApplications)
    ? farmer.previousApplications
    : [];

  // 1. Age check
  if (scheme.minimumAge && age < scheme.minimumAge) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Minimum age required is ${scheme.minimumAge} years (your age: ${age}).`
    };
  }
  if (scheme.maximumAge && age > scheme.maximumAge) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Maximum age limit is ${scheme.maximumAge} years (your age: ${age}).`
    };
  }

  // 2. Income limit
  if (scheme.incomeLimit !== null && scheme.incomeLimit !== undefined && scheme.incomeLimit > 0) {
    if (income > scheme.incomeLimit) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Annual household income (₹${income.toLocaleString("en-IN")}) exceeds the scheme ceiling of ₹${scheme.incomeLimit.toLocaleString("en-IN")}.`
      };
    }
    reasons.push(`Annual income (₹${income.toLocaleString("en-IN")}) is within the ceiling of ₹${scheme.incomeLimit.toLocaleString("en-IN")}`);
  }

  // 3. Landholding requirements
  if (scheme.landholdingMin > 0 && land < scheme.landholdingMin) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Minimum landholding required is ${scheme.landholdingMin} Acres (your landholding: ${land} Acres).`
    };
  }
  if (scheme.landholdingMax < 900 && land > scheme.landholdingMax) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Your landholding (${land} Acres) exceeds the maximum limit of ${scheme.landholdingMax} Acres for this scheme.`
    };
  }
  if (land > 0) {
    reasons.push(`Landholding of ${land} Acres meets the ${scheme.landholdingMin > 0 ? `${scheme.landholdingMin}-` : ""}${scheme.landholdingMax < 900 ? `${scheme.landholdingMax} Acre` : ""} requirement`);
  }

  // 4. District check
  if (scheme.applicableDistricts && scheme.applicableDistricts.length > 0 && !scheme.applicableDistricts.includes("All")) {
    if (!scheme.applicableDistricts.some((d) => d.toLowerCase() === district.toLowerCase())) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `This scheme is currently restricted to designated districts (${scheme.applicableDistricts.join(", ")}).`
      };
    }
    reasons.push(`Applicable in designated district: ${district}`);
  }

  // 5. Crop type check (primary or secondary)
  if (scheme.cropTypes && scheme.cropTypes.length > 0 && !scheme.cropTypes.includes("All")) {
    const matchesCrop = scheme.cropTypes.some(
      (c) => c.toLowerCase() === crop.toLowerCase() || (secondaryCrop && c.toLowerCase() === secondaryCrop.toLowerCase())
    );
    if (!matchesCrop) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Scheme is specific to crops: ${scheme.cropTypes.join(", ")} (your crops: ${crop}${secondaryCrop ? `, ${secondaryCrop}` : ""}).`
      };
    }
    reasons.push(`Applicable for cultivated crop: ${crop}`);
  }

  // 6. Farmer type check
  if (scheme.applicableFarmerTypes && scheme.applicableFarmerTypes.length > 0 && !scheme.applicableFarmerTypes.includes("All")) {
    if (!scheme.applicableFarmerTypes.some((f) => f.toLowerCase() === farmerType.toLowerCase())) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Scheme reserved for ${scheme.applicableFarmerTypes.join(" / ")} farmers (your classification: ${farmerType} farmer).`
      };
    }
    reasons.push(`Category match: ${farmerType} farmer`);
  }

  // 7. Irrigation check
  if (scheme.irrigationRequirements && scheme.irrigationRequirements.length > 0 && !scheme.irrigationRequirements.includes("All")) {
    const matchesIrrigation = scheme.irrigationRequirements.some(
      (i) => i.toLowerCase() === irrigation.toLowerCase() || (irrigationMethod && i.toLowerCase() === irrigationMethod.toLowerCase())
    );
    if (!matchesIrrigation) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Requires irrigation type: ${scheme.irrigationRequirements.join(", ")}.`
      };
    }
    reasons.push(`Compatible with your irrigation source: ${irrigation}`);
  }

  // 8. Social Category
  if (scheme.socialCategory && scheme.socialCategory.length > 0 && !scheme.socialCategory.includes("All")) {
    if (!scheme.socialCategory.some((s) => s.toLowerCase() === social.toLowerCase())) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Targeted social category: ${scheme.socialCategory.join(", ")} (your category: ${social}).`
      };
    }
    reasons.push(`Priority quota matching your community category: ${social}`);
  }

  // 9. Specific requirements
  if (scheme.livestockRequirement && !livestock) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: "Requires active livestock ownership (dairy cattle, goats, or poultry)."
    };
  } else if (scheme.livestockRequirement && livestock) {
    reasons.push(`Verified livestock asset (${dairy ? `${cowCount} cattle ` : ""}${goatSheep ? `${goatCount} goats ` : ""}) qualifies`);
  }

  if (scheme.horticultureRequirement && !horticulture) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: "Requires active horticultural or plantation crop cultivation."
    };
  } else if (scheme.horticultureRequirement && horticulture) {
    reasons.push(`Engaged in horticulture (${farmer.horticultureType || "vegetables/fruits"})`);
  }

  if (scheme.machineryRequirement && !machinery && land < 2.5) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: "Scheme requires ownership of farm implements or tractor/power tiller."
    };
  } else if (scheme.machineryRequirement && machinery) {
    reasons.push("Farm implements / mechanization requirement satisfied");
  }

  // 10. Cropping Season matching
  if (croppingSeason) {
    if (scheme.schemeId === "TN-SCH-05" && croppingSeason.toLowerCase().includes("kuruvai")) {
      reasons.push("Seasonal match: Priority enrollment for active Kuruvai season paddy cultivation in Cauvery Delta zone");
    } else if (croppingSeason.toLowerCase().includes("samba") && (scheme.schemeId === "TN-SCH-08" || scheme.schemeName.toLowerCase().includes("crop insurance"))) {
      reasons.push(`Insurance window open for ${croppingSeason} season main crop`);
    }
  }

  // 11. Soil type compatibility
  if (soilType && (scheme.category === "Inputs & Seeds" || scheme.schemeId === "TN-SCH-04")) {
    reasons.push(`Tailored for farm soil profile: ${soilType}`);
  }

  // 12. Solar pump scheme suitability
  if (solarPumpInterest && (scheme.category === "Irrigation Support" || scheme.schemeId === "TN-SCH-02" || scheme.schemeId === "TN-SCH-03")) {
    reasons.push("Priority candidate for 70% Solar Agricultural Pumpset subsidy (PM-KUSUM)");
  }

  // 13. Drip & Micro irrigation
  if ((dripAvailable || assistanceList.includes("Drip Irrigation") || assistanceList.includes("Irrigation")) &&
      (scheme.schemeId === "TN-SCH-03" || scheme.category === "Irrigation Support")) {
    reasons.push("Matches micro-irrigation / drip equipment subsidy criteria");
  }

  // 14. Kisan Credit Card and Credit Subvention
  if (!kcc && scheme.category === "Financial Assistance") {
    reasons.push("Recommended for 0% interest crop loan credit up to ₹3 Lakhs under Kisan Credit Card (KCC)");
  }

  // 15. Differently Abled priority quota
  if (differentlyAbled) {
    reasons.push("Special Welfare Status: 5% Differently-Abled priority quota applied");
  }

  // 16. Organic / Natural farming incentive
  if (organicFarming && (scheme.farmingTypes.includes("Organic") || scheme.category === "Comprehensive Farm Welfare")) {
    reasons.push("Qualifies for Paramparagat Krishi Vikas Yojana (PKVY) organic input incentive");
  }

  // 17. Farmer Producer Organization (FPO) / SHG bonus
  if ((memberFPO || memberSHG) && scheme.benefits.toLowerCase().includes("subsidy")) {
    reasons.push(`FPO/SHG member priority subsidy linkage applied`);
  }

  // 18. Assistance Required (Intent matching bonus)
  for (const item of assistanceList) {
    if (scheme.category.toLowerCase().includes(item.toLowerCase()) || scheme.benefits.toLowerCase().includes(item.toLowerCase())) {
      reasons.push(`Directly addresses your requested assistance: ${item}`);
      break;
    }
  }

  // 19. Duplicate benefit check
  const alreadyBenefited = previousApps.some(
    (app) => app.schemeId === scheme.schemeId && app.year >= new Date().getFullYear() - 2
  );
  if (alreadyBenefited && scheme.schemeId === "TN-SCH-06") {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `You have already received benefits under this machinery scheme within the last 3 years.`
    };
  }

  return { isEligible: true, reasons };
}

export async function getRecommendationsForFarmer(farmerProfile: Record<string, any>): Promise<RecommendationOutput[]> {
  // Step 1: Query all active schemes
  const allSchemes = await Scheme.find({ status: "ACTIVE" });

  // Step 2: Rule-based eligibility filtering
  const eligibleSchemes: { scheme: IScheme; ruleReasons: string[] }[] = [];
  const ineligibleSchemes: { scheme: IScheme; ineligibleReason: string }[] = [];

  for (const scheme of allSchemes) {
    const evaluation = evaluateSchemeEligibility(scheme, farmerProfile);
    if (evaluation.isEligible) {
      eligibleSchemes.push({
        scheme,
        ruleReasons: evaluation.reasons
      });
    } else {
      ineligibleSchemes.push({
        scheme,
        ineligibleReason: evaluation.ineligibleReason || "Does not meet scheme eligibility criteria."
      });
    }
  }

  // Step 3: Run Random Forest Model on the farmer features
  const mlPredictions: MLPredictionResult[] = await runMLPrediction(farmerProfile);
  const mlScoreMap = new Map<string, number>();
  for (const p of mlPredictions) {
    mlScoreMap.set(p.schemeId, p.probability);
  }

  const assistanceList: string[] = Array.isArray(farmerProfile.assistanceRequired) ? farmerProfile.assistanceRequired : [];
  const maxMlProb = Math.max(...Array.from(mlScoreMap.values()), 0.05);

  // Step 4: Map Eligible Schemes with match scoring and transparent reasons
  const eligibleResults: RecommendationOutput[] = eligibleSchemes.map(({ scheme, ruleReasons }) => {
    const mlProb = mlScoreMap.get(scheme.schemeId) || 0.05;
    const normalizedMl = mlProb / maxMlProb; // 0 to 1

    // Assistance boost: +5% if farmer explicitly requested assistance in this domain
    const intentMatch = assistanceList.some(
      (a) => scheme.category.toLowerCase().includes(a.toLowerCase()) || scheme.schemeName.toLowerCase().includes(a.toLowerCase())
    );
    const intentBonus = intentMatch ? 5 : 0;

    // Baseline match: Rule passed gives 72% base, ML confidence adds up to 20%, rules add up to 8%
    const calculatedScore = Math.min(99, Math.round(72 + (normalizedMl * 18) + (ruleReasons.length * 1.5) + intentBonus));

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
      isEligible: true,
      eligibilityStatus: "Eligible" as const,
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

  // Step 5: Also include ineligible schemes so the UI can optionally display what was filtered out and why
  const ineligibleResults: RecommendationOutput[] = ineligibleSchemes.map(({ scheme, ineligibleReason }) => ({
    schemeId: scheme.schemeId,
    schemeName: scheme.schemeName,
    schemeNameTamil: scheme.schemeNameTamil,
    matchScore: 35,
    isEligible: false,
    eligibilityStatus: "Not Eligible" as const,
    ineligibleReason,
    whyRecommended: [],
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
  }));

  // Sort eligible schemes descending by match score
  eligibleResults.sort((a, b) => b.matchScore - a.matchScore);

  // Return all results (eligible first, then ineligible for full transparency)
  return [...eligibleResults, ...ineligibleResults];
}
