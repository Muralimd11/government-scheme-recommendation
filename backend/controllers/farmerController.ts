import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { Recommendation } from "../models/Recommendation";
import { getRecommendationsForFarmer } from "../services/eligibilityEngine";

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?._id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ success: false, message: "Farmer profile not found." });
      return;
    }
    res.status(200).json({ success: true, data: { farmer: user } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({ success: false, message: "Farmer profile not found." });
      return;
    }

    const body = req.body;

    // Preserve registration identity and location
    const age = existingUser.age || Number(body.age) || 45;
    if (isNaN(age) || age < 18 || age > 110) {
      res.status(400).json({ success: false, message: "Age must be a valid number between 18 and 110." });
      return;
    }

    const landSize = Math.max(0, Number(body.landSize) || 0);
    const cultivableArea = body.cultivableArea !== undefined ? Math.max(0, Number(body.cultivableArea)) : landSize;
    const irrigatedArea = body.irrigatedArea !== undefined ? Math.max(0, Number(body.irrigatedArea)) : 0;
    const rainfedArea = body.rainfedArea !== undefined ? Math.max(0, Number(body.rainfedArea)) : 0;
    const primaryCropArea = body.primaryCropArea !== undefined ? Math.max(0, Number(body.primaryCropArea)) : 0;
    const secondaryCropArea = body.secondaryCropArea !== undefined ? Math.max(0, Number(body.secondaryCropArea)) : 0;

    if (cultivableArea > landSize) {
      res.status(400).json({
        success: false,
        message: `Cultivable land area (${cultivableArea} Ac) cannot exceed total land area (${landSize} Ac).`
      });
      return;
    }

    if (irrigatedArea + rainfedArea > cultivableArea + 0.05) {
      res.status(400).json({
        success: false,
        message: `Total irrigated (${irrigatedArea} Ac) + rainfed (${rainfedArea} Ac) area cannot exceed cultivable land area (${cultivableArea} Ac).`
      });
      return;
    }

    if (primaryCropArea > cultivableArea + 0.05) {
      res.status(400).json({
        success: false,
        message: `Primary crop area (${primaryCropArea} Ac) cannot exceed cultivable land area (${cultivableArea} Ac).`
      });
      return;
    }

    const annualIncome = Math.max(0, Number(body.annualIncome) || 0);
    const agriculturalIncome = Math.max(0, Number(body.agriculturalIncome) || 0);
    const nonAgriculturalIncome = Math.max(0, Number(body.nonAgriculturalIncome) || 0);

    const cowCount = Math.max(0, Number(body.cowCount) || 0);
    const goatCount = Math.max(0, Number(body.goatCount) || 0);
    const poultryCount = Math.max(0, Number(body.poultryCount) || 0);
    const horticultureArea = Math.max(0, Number(body.horticultureArea) || 0);

    // Auto-classify farmer type based on land size
    let farmerType: "Marginal" | "Small" | "Medium" | "Large" = "Small";
    if (landSize <= 2.5) {
      farmerType = "Marginal";
    } else if (landSize <= 5.0) {
      farmerType = "Small";
    } else if (landSize <= 10.0) {
      farmerType = "Medium";
    } else {
      farmerType = "Large";
    }

    const landOwnership = body.landOwnershipType === "Leased Land" || body.landOwnershipType === "Tenant Farmer"
      ? "Leased"
      : body.landOwnershipType === "Sharecropper"
      ? "Shared"
      : "Owned";

    const updatePayload: Record<string, any> = {
      preferredLanguage: body.preferredLanguage || "en",
      district: existingUser.district || body.district || "Thanjavur",
      state: "Tamil Nadu",
      block: existingUser.block || body.block || "Thanjavur",
      village: existingUser.village || body.village || "Vallam",
      dateOfBirth: body.dateOfBirth || existingUser.dateOfBirth,
      age,
      gender: existingUser.gender || body.gender || "Male",
      socialCategory: existingUser.socialCategory || body.socialCategory || "OBC",
      farmerStatus: body.farmerStatus || "Owner",
      landOwnership,
      landOwnershipType: body.landOwnershipType || "Own Land",
      landSize,
      cultivableArea,
      irrigatedArea,
      rainfedArea,
      pattaAvailable: body.pattaAvailable || "Yes",
      surveyRecordAvailable: body.surveyRecordAvailable || "Yes",
      registeredLease: body.registeredLease || "Not Applicable",
      leaseDuration: body.leaseDuration || "",
      registrationStatus: body.registrationStatus || "Registered",
      landType: body.landType || "Wetland (Nanjai)",
      cropType: body.cropType || body.primaryCrop || "Paddy",
      secondaryCrop: body.secondaryCrop || "",
      previousCrop: body.previousCrop || "",
      primaryCropArea,
      secondaryCropArea,
      cropsPerYear: Math.max(1, Number(body.cropsPerYear) || 2),
      sowingStatus: body.sowingStatus || "Growing",
      cropInsuranceStatus: body.cropInsuranceStatus || "Not Insured",
      previousCropLoss: body.previousCropLoss || "No",
      farmingType: body.farmingType || "Conventional",
      irrigationType: body.irrigationType || body.irrigationSource || "Canal",
      irrigationMethod: body.irrigationMethod || "Flood",
      electricityAvailable: body.electricityAvailable || "Yes",
      agriculturalElectricityConnection: body.agriculturalElectricityConnection || "Yes",
      pumpType: body.pumpType || "Electric",
      existingSolarPump: body.existingSolarPump || "No",
      dripAvailable: body.dripAvailable || "No",
      sprinklerAvailable: body.sprinklerAvailable || "No",
      farmPondAvailable: body.farmPondAvailable || "No",
      bankAccountAvailable: body.bankAccountAvailable || "Yes",
      dbtEnabled: body.dbtEnabled || "Yes",
      bankAccountType: body.bankAccountType || "Individual",
      farmerType,
      annualIncome,
      agriculturalIncome,
      nonAgriculturalIncome,
      soilType: body.soilType || "Alluvial / Loamy",
      croppingSeason: body.croppingSeason || "Samba",
      pmKisanBeneficiary: Boolean(body.pmKisanBeneficiary),
      kisanCreditCard: Boolean(body.kisanCreditCard),
      soilHealthCard: Boolean(body.soilHealthCard),
      solarPumpInterest: Boolean(body.solarPumpInterest || body.existingSolarPump === "Yes"),
      differentlyAbled: Boolean(body.differentlyAbled),
      cowCount,
      goatCount,
      poultryCount,
      dairyFarming: body.dairyFarming || (cowCount > 0 ? "Yes" : "No"),
      goatSheepFarming: body.goatSheepFarming || (goatCount > 0 ? "Yes" : "No"),
      poultryFarming: body.poultryFarming || (poultryCount > 0 ? "Yes" : "No"),
      fisheries: body.fisheries || "No",
      beekeeping: body.beekeeping || "No",
      sericulture: body.sericulture || "No",
      mushroomCultivation: body.mushroomCultivation || "No",
      agroforestry: body.agroforestry || "No",
      horticultureType: body.horticultureType || "None",
      horticultureArea,
      organicFarming: body.organicFarming || "No",
      organicCertificationStatus: body.organicCertificationStatus || "Not Applicable",
      naturalFarming: body.naturalFarming || "No",
      organicCertified: body.organicCertificationStatus === "Certified" || Boolean(body.organicCertified),
      livestockOwnership: (cowCount > 0 || goatCount > 0 || poultryCount > 0) || Boolean(body.livestockOwnership),
      horticultureActivity: (body.horticultureType && body.horticultureType !== "None") || Boolean(body.horticultureActivity),
      machineryOwnership: Boolean(body.machineryOwnership) || (Array.isArray(body.machineryList) && body.machineryList.length > 0),
      machineryList: Array.isArray(body.machineryList) ? body.machineryList : [],
      infrastructureList: Array.isArray(body.infrastructureList) ? body.infrastructureList : [],
      subsidyReceived: body.subsidyReceived || "No",
      previouslyReceivedBenefit: body.previouslyReceivedBenefit || "No",
      previouslyAppliedScheme: body.previouslyAppliedScheme || "No",
      previousApplications: Array.isArray(body.previousApplications) ? body.previousApplications : [],
      activeKCC: body.activeKCC || (body.kisanCreditCard ? "Yes" : "No"),
      agriculturalLoan: body.agriculturalLoan || "No",
      cropInsurance: body.cropInsurance || "No",
      hasCropLoss: body.hasCropLoss || body.previousCropLoss || "No",
      memberFPO: body.memberFPO || "No",
      memberFIG: body.memberFIG || "No",
      memberSHG: body.memberSHG || "No",
      memberJLG: body.memberJLG || "No",
      educationLevel: body.educationLevel || "Higher Secondary",
      agriTrainingReceived: body.agriTrainingReceived || "No",
      agriTrainingType: body.agriTrainingType || "",
      skillTraining: body.skillTraining || "No",
      assistanceRequired: Array.isArray(body.assistanceRequired) ? body.assistanceRequired : []
    };

    if (body.farmerRegistrationId) {
      updatePayload.farmerRegistrationId = body.farmerRegistrationId;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    // Recalculate scheme eligibility & ML recommendations based on new attributes
    const updatedRecommendations = await getRecommendationsForFarmer(updatePayload);

    // Save snapshot to Recommendation collection
    await Recommendation.create({
      farmerId: userId,
      farmerProfileSnapshot: updatePayload,
      recommendations: updatedRecommendations.map((r) => ({
        schemeId: r.schemeId,
        schemeName: r.schemeName,
        matchScore: r.matchScore,
        whyRecommended: r.whyRecommended,
        governmentLevel: r.governmentLevel,
        department: r.department,
        benefits: r.benefits,
        requiredDocuments: r.requiredDocuments
      }))
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully. Scheme recommendations refreshed.",
      data: {
        farmer: updated,
        totalEligible: updatedRecommendations.length,
        recommendations: updatedRecommendations
      }
    });
  } catch (err: any) {
    console.error("[Update Farmer Profile Error]", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update profile." });
  }
}

export async function getFarmerDashboardSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmerId = req.user?._id;

    // Applications submitted by this farmer
    const applications = await Application.find({ farmerId }).lean();
    const totalApplications = applications.length;
    const approvedApplications = applications.filter((a) => a.status === "APPROVED").length;
    const pendingApplications = applications.filter((a) => ["SUBMITTED", "PENDING", "UNDER_VERIFICATION"].includes(a.status)).length;
    const rejectedApplications = applications.filter((a) => a.status === "REJECTED").length;

    // Latest recommendation count
    const latestRecommendation = await Recommendation.findOne({ farmerId }).sort({ createdAt: -1 });
    let recommendedCount = latestRecommendation ? latestRecommendation.recommendations.length : 0;

    if (recommendedCount === 0 && farmerId) {
      // Calculate live eligible recommendations dynamically so it does not default to 0
      const userDoc = await User.findById(farmerId).lean();
      if (userDoc) {
        const liveRecs = await getRecommendationsForFarmer(userDoc);
        recommendedCount = liveRecs.filter((r) => r.isEligible !== false).length;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          recommendedCount,
          totalApplications,
          approvedApplications,
          pendingApplications,
          rejectedApplications
        },
        profile: req.user,
        recentApplications: applications.slice(0, 5)
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
