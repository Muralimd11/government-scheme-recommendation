import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Scheme } from "../models/Scheme";
import { Application } from "../models/Application";
import { DocumentModel } from "../models/Document";
import { Recommendation } from "../models/Recommendation";
import { AuditLog } from "../models/AuditLog";
import { generateReportData } from "../services/reportService";

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    // 1. Core metric counts via real MongoDB queries
    const [
      totalFarmers,
      totalSchemes,
      totalApplications,
      pendingVerification,
      approvedApplications,
      rejectedApplications
    ] = await Promise.all([
      User.countDocuments({ role: "FARMER" }),
      Scheme.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ["SUBMITTED", "PENDING", "UNDER_VERIFICATION"] } }),
      Application.countDocuments({ status: "APPROVED" }),
      Application.countDocuments({ status: "REJECTED" })
    ]);

    // 2. Real MongoDB Aggregations
    // Applications by status
    const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;

    // District-wise farmer distribution
    const districtDistribution = await User.aggregate([
      { $match: { role: "FARMER" } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Scheme categories
    const categoryDistribution = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Farmer type distribution
    const farmerTypeDistribution = await User.aggregate([
      { $match: { role: "FARMER" } },
      { $group: { _id: "$farmerType", count: { $sum: 1 } } }
    ]);

    // Crop distribution
    const cropDistribution = await User.aggregate([
      { $match: { role: "FARMER" } },
      { $group: { _id: "$cropType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Most recommended schemes from recommendations collection
    const mostRecommended = await Recommendation.aggregate([
      { $unwind: "$recommendations" },
      { $group: { _id: "$recommendations.schemeName", count: { $sum: 1 }, avgScore: { $avg: "$recommendations.matchScore" } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalFarmers,
          totalSchemes,
          totalApplications,
          pendingVerification,
          approvedApplications,
          rejectedApplications,
          approvalRate
        },
        districtDistribution: districtDistribution.map((d) => ({ district: d._id || "Other", count: d.count })),
        categoryDistribution: categoryDistribution.map((c) => ({ category: c._id || "General", count: c.count })),
        farmerTypeDistribution: farmerTypeDistribution.map((f) => ({ type: f._id || "Small", count: f.count })),
        cropDistribution: cropDistribution.map((c) => ({ crop: c._id || "Paddy", count: c.count })),
        mostRecommended: mostRecommended.map((m) => ({
          name: m._id,
          count: m.count,
          avgScore: Math.round(m.avgScore || 85)
        }))
      }
    });
  } catch (err: any) {
    console.error("[Admin Dashboard Stats]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFarmersList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, district, status, farmerType, page = 1, limit = 10 } = req.query;

    const filter: Record<string, any> = { role: "FARMER" };

    if (search) {
      const reg = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { fullName: reg },
        { email: reg },
        { mobile: reg },
        { farmerRegistrationId: reg }
      ];
    }

    if (district && district !== "All") {
      filter.district = district;
    }

    if (status && status !== "All") {
      filter.accountStatus = status;
    }

    if (farmerType && farmerType !== "All") {
      filter.farmerType = farmerType;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [farmers, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        farmers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateFarmerStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!["ACTIVE", "DISABLED"].includes(accountStatus)) {
      res.status(400).json({ success: false, message: "Invalid account status value." });
      return;
    }

    const farmer = await User.findByIdAndUpdate(id, { accountStatus }, { new: true }).select("-passwordHash");
    if (!farmer) {
      res.status(404).json({ success: false, message: "Farmer not found." });
      return;
    }

    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: `FARMER_${accountStatus}`,
        entityType: "USER",
        entityId: farmer._id.toString(),
        details: { newStatus: accountStatus }
      });
    }

    res.status(200).json({
      success: true,
      message: `Farmer account status updated to ${accountStatus}.`,
      data: { farmer }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createScheme(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schemeData = req.body;

    const existing = await Scheme.findOne({ schemeId: schemeData.schemeId?.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Scheme ID ${schemeData.schemeId} already exists.` });
      return;
    }

    const newScheme = await Scheme.create({
      ...schemeData,
      schemeId: schemeData.schemeId.toUpperCase(),
      lastVerifiedDate: new Date(),
      isDemonstrationData: false
    });

    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: "SCHEME_CREATED",
        entityType: "SCHEME",
        entityId: newScheme.schemeId,
        details: { name: newScheme.schemeName, department: newScheme.department }
      });
    }

    res.status(201).json({
      success: true,
      message: "Government scheme registered successfully.",
      data: { scheme: newScheme }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateScheme(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const scheme = await Scheme.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { schemeId: id.toUpperCase() }] },
      { ...updates, lastVerifiedDate: new Date() },
      { new: true }
    );

    if (!scheme) {
      res.status(404).json({ success: false, message: "Scheme not found." });
      return;
    }

    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: "SCHEME_UPDATED",
        entityType: "SCHEME",
        entityId: scheme.schemeId,
        details: { updates }
      });
    }

    res.status(200).json({
      success: true,
      message: "Scheme details updated successfully.",
      data: { scheme }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteScheme(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { schemeId: id.toUpperCase() }]
    });

    if (!scheme) {
      res.status(404).json({ success: false, message: "Scheme not found." });
      return;
    }

    await scheme.deleteOne();

    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: "SCHEME_DELETED",
        entityType: "SCHEME",
        entityId: scheme.schemeId,
        details: { name: scheme.schemeName }
      });
    }

    res.status(200).json({
      success: true,
      message: "Scheme deleted successfully."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllDocuments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status = "ALL" } = req.query;
    const filter: Record<string, any> = {};
    if (status !== "ALL") {
      filter.verificationStatus = status;
    }

    const docs = await DocumentModel.find(filter)
      .populate("farmerId", "fullName email mobile district farmerRegistrationId")
      .sort({ uploadedAt: -1 })
      .lean();

    const formatted = docs.map((d: any) => ({
      ...d,
      fileUrl: `/uploads/${d.filePath}`
    }));

    res.status(200).json({
      success: true,
      data: { documents: formatted }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function verifyDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { verificationStatus, adminRemarks } = req.body;

    if (!["VERIFIED", "REJECTED", "CORRECTION_REQUIRED", "PENDING"].includes(verificationStatus)) {
      res.status(400).json({ success: false, message: "Invalid verification status." });
      return;
    }

    const doc = await DocumentModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { documentId: id }]
    });

    if (!doc) {
      res.status(404).json({ success: false, message: "Document not found." });
      return;
    }

    doc.verificationStatus = verificationStatus;
    doc.adminRemarks = adminRemarks || "";
    await doc.save();

    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: `DOCUMENT_${verificationStatus}`,
        entityType: "DOCUMENT",
        entityId: doc.documentId,
        details: { remarks: adminRemarks }
      });
    }

    res.status(200).json({
      success: true,
      message: `Document marked as ${verificationStatus}.`,
      data: { document: doc }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getReports(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { reportType = "APPLICATIONS", format = "JSON" } = req.query;
    const report = await generateReportData(String(reportType));

    if (String(format).toUpperCase() === "CSV") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${String(reportType).toLowerCase()}_report.csv`);
      res.send(report.csv);
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const logs = await AuditLog.find()
      .populate("adminId", "fullName email")
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      data: { logs }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
