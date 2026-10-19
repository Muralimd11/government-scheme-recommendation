import { Scheme, IScheme } from "../models/Scheme";
import { runMLPrediction, MLPredictionResult } from "./mlService";
import { translateContent } from "./geminiService";

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
  ineligibleReasonTamil?: string;
  whyRecommended: string[];
  whyRecommendedTamil?: string[];
  governmentLevel: string;
  governmentLevelTamil?: string;
  department: string;
  departmentTamil?: string;
  category: string;
  categoryTamil?: string;
  benefits: string;
  benefitsTamil?: string;
  description: string;
  descriptionTamil?: string;
  requiredDocuments: string[];
  requiredDocumentsTamil?: string[];
  officialWebsite: string;
  applicationUrl: string;
  applicationDeadline: string;
  isDemonstrationData: boolean;
  verificationStatus?: string;
  mlConfidenceRate?: string;
  mlProbability?: number;
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

  // 1. Age check (only if explicitly specified in source data; otherwise unknown)
  const minAge = scheme.rawMinAge !== undefined && scheme.rawMinAge !== null 
    ? scheme.rawMinAge 
    : (scheme.minimumAge > 0 && scheme.minimumAge !== 18 ? scheme.minimumAge : null);
  const maxAge = scheme.rawMaxAge !== undefined && scheme.rawMaxAge !== null 
    ? scheme.rawMaxAge 
    : (scheme.maximumAge < 100 && scheme.maximumAge !== 80 ? scheme.maximumAge : null);

  if (minAge !== null && age < minAge) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Minimum age required is ${minAge} years (your age: ${age}).`
    };
  } else if (minAge !== null) {
    reasons.push(`Farmer age (${age} years) satisfies verified minimum requirement of ${minAge} years`);
  }

  if (maxAge !== null && age > maxAge) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Maximum age limit is ${maxAge} years (your age: ${age}).`
    };
  } else if (maxAge !== null) {
    reasons.push(`Farmer age (${age} years) is within verified maximum limit of ${maxAge} years`);
  }

  // 2. Income limit (only if explicitly specified in source data; otherwise unknown)
  const incomeLimit = scheme.rawAnnualIncomeLimit !== undefined && scheme.rawAnnualIncomeLimit !== null 
    ? scheme.rawAnnualIncomeLimit 
    : scheme.incomeLimit;
  if (incomeLimit !== null && incomeLimit !== undefined && incomeLimit > 0) {
    if (income > incomeLimit) {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: `Annual household income (₹${income.toLocaleString("en-IN")}) exceeds the verified scheme ceiling of ₹${incomeLimit.toLocaleString("en-IN")}.`
      };
    }
    reasons.push(`Annual income (₹${income.toLocaleString("en-IN")}) is within the verified ceiling of ₹${incomeLimit.toLocaleString("en-IN")}`);
  }

  // 3. Gender verification
  const farmerGender = String(farmer.gender || "Male").trim().toLowerCase();
  if (scheme.gender && scheme.gender !== "All") {
    if (scheme.gender.toLowerCase() === "female" && farmerGender !== "female") {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: "This scheme is exclusively reserved for women / female applicants."
      };
    }
    if (scheme.gender.toLowerCase() === "male" && farmerGender !== "male") {
      return {
        isEligible: false,
        reasons: [],
        ineligibleReason: "This scheme is reserved for male applicants."
      };
    }
    reasons.push(`Gender eligibility condition (${scheme.gender}) verified`);
  }

  // 4. Landholding requirements
  const landMin = scheme.rawLandMinAcres !== undefined && scheme.rawLandMinAcres !== null
    ? scheme.rawLandMinAcres
    : scheme.landholdingMin;
  const landMax = scheme.rawLandMaxAcres !== undefined && scheme.rawLandMaxAcres !== null
    ? scheme.rawLandMaxAcres
    : scheme.landholdingMax;

  if (landMin > 0 && land < landMin) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Minimum landholding required is ${landMin} Acres (your landholding: ${land} Acres).`
    };
  }
  if (landMax < 900 && land > landMax) {
    return {
      isEligible: false,
      reasons: [],
      ineligibleReason: `Your landholding (${land} Acres) exceeds the maximum limit of ${landMax} Acres for this scheme.`
    };
  }
  if (land > 0 && (landMin > 0 || landMax < 900)) {
    reasons.push(`Landholding of ${land} Acres meets verified ${landMin > 0 ? `${landMin}-` : ""}${landMax < 900 ? `${landMax} Acre` : ""} requirement`);
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

function cleanRequiredDocuments(rawDocs: any): string[] {
  if (!rawDocs) return ["Aadhaar Card", "Patta / Chitta (Land Ownership Record)", "Bank Passbook (Aadhaar linked)", "Active Mobile Number"];

  let list: string[] = [];
  if (Array.isArray(rawDocs)) {
    for (const item of rawDocs) {
      if (typeof item === "string") {
        const subList = item.split(/\r?\n|[•]+/).map((s) => s.trim()).filter(Boolean);
        list.push(...subList);
      } else if (item && typeof item === "object") {
        list.push(item.documentType || item.name || JSON.stringify(item));
      }
    }
  } else if (typeof rawDocs === "string") {
    list = rawDocs.split(/\r?\n|[•]+/).map((s) => s.trim()).filter(Boolean);
  }

  // Rejoin fragmented items that end with 'or' or 'and'
  const merged: string[] = [];
  for (let i = 0; i < list.length; i++) {
    let item = String(list[i]).trim();
    if (!item) continue;
    if (/\b(or|and)$/i.test(item) && i + 1 < list.length) {
      item = item + " " + String(list[i + 1]).trim();
      i++;
    }
    merged.push(item);
  }

  const standardRules = [
    { pattern: /aadhaar/i, label: "Aadhaar Card" },
    { pattern: /patta|chitta|land record|land ownership/i, label: "Patta / Chitta (Land Ownership Record)" },
    { pattern: /bank|passbook|account/i, label: "Bank Passbook (Aadhaar linked)" },
    { pattern: /mobile|phone/i, label: "Active Mobile Number" },
    { pattern: /caste|community/i, label: "Community / Caste Certificate" },
    { pattern: /bpl|ration|income certificate/i, label: "BPL / Ration Card" },
    { pattern: /age proof|birth/i, label: "Age Proof Certificate" },
    { pattern: /khadi|artisan/i, label: "Khadi Artisan / Institution Certificate" },
    { pattern: /project proposal|workshed/i, label: "Project Proposal / Work-shed Details" },
  ];

  const results: string[] = [];
  const seen = new Set<string>();

  for (let d of merged) {
    let cleaned = d.replace(/^[\s•\-\*\d\.\)]+/, "").trim();
    let matched = false;
    for (const rule of standardRules) {
      if (rule.pattern.test(cleaned)) {
        if (!seen.has(rule.label)) {
          seen.add(rule.label);
          results.push(rule.label);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      cleaned = cleaned
        .replace(/\s+(or|and)$/i, "")
        .replace(/\(if applicable\)|\(if required\)/gi, "")
        .trim();
      if (cleaned.length > 3 && !seen.has(cleaned.toLowerCase())) {
        seen.add(cleaned.toLowerCase());
        const formatted = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
        results.push(formatted);
      }
    }
  }

  if (results.length === 0) {
    return ["Aadhaar Card", "Patta / Chitta (Land Ownership Record)", "Bank Passbook (Aadhaar linked)", "Active Mobile Number"];
  }

  return results.slice(0, 5);
}

function cleanBenefitSummary(benefits: any): string {
  if (!benefits) return "Financial and agricultural welfare subsidy";
  let text = String(benefits).trim();

  // If text contains multiple bullets '•' or newlines, split them
  const parts = text.split(/\r?\n|[•]+/)
    .map((p) => p.replace(/^[\s\-\*–—:]+/, "").trim())
    .filter((p) => p.length > 5);

  if (parts.length === 0) return text.slice(0, 150);

  let summary = parts[0];
  if (parts.length > 1 && summary.length < 90) {
    summary += " • " + parts[1];
  }
  if (summary.length > 180) {
    summary = summary.slice(0, 177) + "...";
  }
  return summary;
}

export async function getRecommendationsForFarmer(farmerProfile: Record<string, any>): Promise<RecommendationOutput[]> {
  // Step 1: Query all non-disabled schemes from MongoDB
  const allSchemes = await Scheme.find({ status: { $ne: "DISABLED" } });

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
  const mlConfidenceMap = new Map<string, string>();
  for (const p of mlPredictions) {
    if (p.schemeId) {
      mlScoreMap.set(p.schemeId, p.probability);
      if (p.confidenceRate) {
        mlConfidenceMap.set(p.schemeId, p.confidenceRate);
      }
    }
  }

  const assistanceList: string[] = Array.isArray(farmerProfile.assistanceRequired) ? farmerProfile.assistanceRequired : [];
  const maxMlProb = Math.max(...Array.from(mlScoreMap.values()), 0.05);

  // Step 4: Map Eligible Schemes with two-stage hybrid match scoring and transparent reasons
  const eligibleResults: RecommendationOutput[] = await Promise.all(
    eligibleSchemes.map(async ({ scheme, ruleReasons }) => {
      const schemeId = scheme.schemeId || String(scheme._id);
      const legacyId = (scheme as any).legacySchemeId;
      const aliases = (scheme as any).aliases || [];

      let mlProb = mlScoreMap.get(schemeId);
      let confidenceRate = mlConfidenceMap.get(schemeId);
      if (mlProb === undefined && legacyId && mlScoreMap.has(legacyId)) {
        mlProb = mlScoreMap.get(legacyId);
        confidenceRate = mlConfidenceMap.get(legacyId);
      }
      if (mlProb === undefined && Array.isArray(aliases)) {
        for (const alias of aliases) {
          if (mlScoreMap.has(alias)) {
            mlProb = mlScoreMap.get(alias);
            confidenceRate = mlConfidenceMap.get(alias);
            break;
          }
        }
      }
      if (mlProb === undefined) {
        mlProb = 0.05;
        confidenceRate = `${(mlProb * 100).toFixed(1)}%`;
      }
      const normalizedMl = mlProb / maxMlProb; // 0 to 1

      const category = scheme.category || "General Subsidies";
      const schemeName = scheme.schemeName || "Government Welfare Scheme";

      // Assistance boost: +5% if farmer explicitly requested assistance in this domain
      const intentMatch = assistanceList.some(
        (a) => category.toLowerCase().includes(a.toLowerCase()) || schemeName.toLowerCase().includes(a.toLowerCase())
      );
      const intentBonus = intentMatch ? 5 : 0;

      const calculatedScore = Math.min(99, Math.round(70 + (normalizedMl * 20) + Math.min(6, ruleReasons.length * 1.2) + intentBonus));

      const whyRecommended = [...ruleReasons];
      
      // Add concise benefit highlight to criteria breakdown
      const benefitHighlight = cleanBenefitSummary(scheme.benefits);
      if (benefitHighlight && !whyRecommended.some(r => r.toLowerCase().includes("benefit") || r.toLowerCase().includes("subsidy"))) {
        whyRecommended.push(`Recommended for: ${benefitHighlight}`);
      }

      if (mlProb > 0.15) {
        whyRecommended.push(`High statistical suitability match (${confidenceRate} calibrated confidence) based on Random Forest profile analysis`);
      }
      if (whyRecommended.length === 0) {
        whyRecommended.push("General state agricultural welfare eligibility");
      }

      const isUnverified = scheme.schemeStatus === "Requires verification" ||
        String(scheme.verificationStatus || "").toLowerCase().includes("not independently verified") ||
        scheme.isDemonstrationData === true;
      const statusVal = (isUnverified ? "Potentially Eligible" : "Eligible") as "Eligible" | "Potentially Eligible";

      if (isUnverified) {
        whyRecommended.push("Preliminary criteria satisfied (official departmental verification required)");
      }

      const cleanedDocs = cleanRequiredDocuments(scheme.requiredDocuments);
      const whyRecommendedTamil = await Promise.all(whyRecommended.map(r => translateContent(r, "ta")));
      const governmentLevelTamil = await translateContent(scheme.governmentLevel || "Tamil Nadu Government", "ta");
      const departmentTamil = await translateContent(scheme.department || "Department of Agriculture", "ta");
      const categoryTamil = await translateContent(category, "ta");
      const requiredDocumentsTamil = await Promise.all(cleanedDocs.map(d => translateContent(d, "ta")));

      return {
        schemeId,
        schemeName,
        schemeNameTamil: scheme.schemeNameTamil,
        matchScore: calculatedScore,
        isEligible: true,
        eligibilityStatus: statusVal,
        whyRecommended,
        whyRecommendedTamil,
        verificationStatus: scheme.verificationStatus || (isUnverified ? "Requires verification" : "Verified"),
        mlConfidenceRate: confidenceRate,
        mlProbability: mlProb,
        governmentLevel: scheme.governmentLevel || "Tamil Nadu Government",
        governmentLevelTamil,
        department: scheme.department || "Department of Agriculture",
        departmentTamil,
        category,
        categoryTamil,
        benefits: cleanBenefitSummary(scheme.benefits) || scheme.description || "Financial and agricultural subsidy benefits",
        benefitsTamil: scheme.benefitsTamil || (scheme.benefits ? await translateContent(cleanBenefitSummary(scheme.benefits), "ta") : undefined),
        description: scheme.description || scheme.benefits || "",
        descriptionTamil: scheme.descriptionTamil,
        requiredDocuments: cleanedDocs,
        requiredDocumentsTamil,
        officialWebsite: scheme.officialWebsite || "https://tnagrisnet.tn.gov.in",
        applicationUrl: scheme.applicationUrl || "",
        applicationDeadline: scheme.applicationDeadline || "Ongoing",
        isDemonstrationData: Boolean(scheme.isDemonstrationData)
      };
    })
  );

  // Step 5: Also include ineligible schemes for full transparency
  const ineligibleResults: RecommendationOutput[] = await Promise.all(
    ineligibleSchemes.map(async ({ scheme, ineligibleReason }) => {
      const docs = cleanRequiredDocuments(scheme.requiredDocuments);
      const [
        ineligibleReasonTamil,
        governmentLevelTamil,
        departmentTamil,
        categoryTamil,
        requiredDocumentsTamil,
        benefitsTamil
      ] = await Promise.all([
        translateContent(ineligibleReason, "ta"),
        translateContent(scheme.governmentLevel || "Tamil Nadu Government", "ta"),
        translateContent(scheme.department || "Department of Agriculture", "ta"),
        translateContent(scheme.category || "General Subsidies", "ta"),
        Promise.all(docs.map(d => translateContent(d, "ta"))),
        scheme.benefitsTamil ? Promise.resolve(scheme.benefitsTamil) : translateContent(cleanBenefitSummary(scheme.benefits), "ta")
      ]);

      return {
        schemeId: scheme.schemeId || String(scheme._id),
        schemeName: scheme.schemeName || "Government Welfare Scheme",
        schemeNameTamil: scheme.schemeNameTamil,
        matchScore: 35,
        isEligible: false,
        eligibilityStatus: "Not Eligible" as const,
        ineligibleReason,
        ineligibleReasonTamil,
        whyRecommended: [],
        whyRecommendedTamil: [],
        governmentLevel: scheme.governmentLevel || "Tamil Nadu Government",
        governmentLevelTamil,
        department: scheme.department || "Department of Agriculture",
        departmentTamil,
        category: scheme.category || "General Subsidies",
        categoryTamil,
        benefits: cleanBenefitSummary(scheme.benefits) || scheme.description || "Financial and agricultural subsidy benefits",
        benefitsTamil,
        description: scheme.description || scheme.benefits || "",
        descriptionTamil: scheme.descriptionTamil,
        requiredDocuments: docs,
        requiredDocumentsTamil,
        officialWebsite: scheme.officialWebsite || "https://tnagrisnet.tn.gov.in",
        applicationUrl: scheme.applicationUrl || "",
        applicationDeadline: scheme.applicationDeadline || "Ongoing",
        isDemonstrationData: Boolean(scheme.isDemonstrationData)
      };
    })
  );

  // Sort eligible schemes descending by match score
  eligibleResults.sort((a, b) => b.matchScore - a.matchScore);

  // Return all results (eligible first, then ineligible for full transparency)
  return [...eligibleResults, ...ineligibleResults];
}
