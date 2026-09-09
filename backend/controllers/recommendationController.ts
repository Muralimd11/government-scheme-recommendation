import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getRecommendationsForFarmer } from "../services/eligibilityEngine";
import { Recommendation } from "../models/Recommendation";
import { User } from "../models/User";

export async function getRecommendations(req: AuthRequest, res: Response): Promise<void> {
  try {
    let profileData = { ...req.body };

    // If user is authenticated and fields aren't supplied in body, merge with user's db profile
    if (req.user) {
      const user = await User.findById(req.user._id).lean();
      if (user) {
        profileData = {
          age: profileData.age || user.age,
          gender: profileData.gender || user.gender,
          district: profileData.district || user.district,
          landSize: profileData.landSize !== undefined ? profileData.landSize : user.landSize,
          landOwnership: profileData.landOwnership || user.landOwnership,
          cropType: profileData.cropType || user.cropType,
          farmingType: profileData.farmingType || user.farmingType,
          irrigationType: profileData.irrigationType || user.irrigationType,
          farmerType: profileData.farmerType || user.farmerType,
          annualIncome: profileData.annualIncome !== undefined ? profileData.annualIncome : user.annualIncome,
          socialCategory: profileData.socialCategory || user.socialCategory,
          livestockOwnership: profileData.livestockOwnership !== undefined ? profileData.livestockOwnership : user.livestockOwnership,
          horticultureActivity: profileData.horticultureActivity !== undefined ? profileData.horticultureActivity : user.horticultureActivity,
          machineryOwnership: profileData.machineryOwnership !== undefined ? profileData.machineryOwnership : user.machineryOwnership
        };
      }
    }

    // Run eligibility filtering + ML Random Forest ranking
    const recommendations = await getRecommendationsForFarmer(profileData);

    // If farmer is authenticated, store recommendations for dashboard and history tracking
    if (req.user) {
      await Recommendation.create({
        farmerId: req.user._id,
        farmerProfileSnapshot: profileData,
        recommendations: recommendations.map((r) => ({
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
    }

    res.status(200).json({
      success: true,
      message: `${recommendations.length} government schemes recommended based on your farming profile.`,
      data: {
        totalEligible: recommendations.length,
        farmerProfile: profileData,
        recommendations
      }
    });
  } catch (err: any) {
    console.error("[Recommendation Controller Error]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to process scheme recommendations."
    });
  }
}
