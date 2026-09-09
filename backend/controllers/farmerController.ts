import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { Recommendation } from "../models/Recommendation";

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
    const {
      fullName,
      preferredLanguage,
      district,
      dateOfBirth,
      age,
      gender,
      farmerStatus,
      landOwnership,
      landSize,
      landType,
      cropType,
      farmingType,
      irrigationType,
      farmerType,
      annualIncome,
      socialCategory,
      livestockOwnership,
      horticultureActivity,
      machineryOwnership
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        preferredLanguage,
        district,
        dateOfBirth,
        age: Number(age),
        gender,
        farmerStatus,
        landOwnership,
        landSize: Number(landSize),
        landType,
        cropType,
        farmingType,
        irrigationType,
        farmerType,
        annualIncome: Number(annualIncome),
        socialCategory,
        livestockOwnership: Boolean(livestockOwnership),
        horticultureActivity: Boolean(horticultureActivity),
        machineryOwnership: Boolean(machineryOwnership)
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { farmer: updated }
    });
  } catch (err: any) {
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
    const recommendedCount = latestRecommendation ? latestRecommendation.recommendations.length : 0;

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
