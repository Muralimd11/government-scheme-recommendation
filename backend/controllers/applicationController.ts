import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Application } from "../models/Application";
import { Scheme } from "../models/Scheme";
import { AuditLog } from "../models/AuditLog";

export async function createApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmerId = req.user?._id;
    const { schemeId, documents = [] } = req.body;

    if (!schemeId) {
      res.status(400).json({ success: false, message: "Scheme selection is required." });
      return;
    }

    const scheme = await Scheme.findOne({
      $or: [{ _id: schemeId.match(/^[0-9a-fA-F]{24}$/) ? schemeId : null }, { schemeId: schemeId.toUpperCase() }]
    });

    if (!scheme) {
      res.status(404).json({ success: false, message: "Scheme not found." });
      return;
    }

    // Check if duplicate active application exists for this scheme by this farmer
    const existing = await Application.findOne({
      farmerId,
      schemeId: scheme._id,
      status: { $in: ["SUBMITTED", "PENDING", "UNDER_VERIFICATION", "APPROVED"] }
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: `You have already submitted an application (${existing.applicationId}) for ${scheme.schemeName}. Current status: ${existing.status}`
      });
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `TN-APP-2026-${randomSuffix}`;

    const newApp = await Application.create({
      applicationId,
      farmerId,
      schemeId: scheme._id,
      schemeCode: scheme.schemeId,
      schemeName: scheme.schemeName,
      status: "SUBMITTED",
      documents: documents.map((doc: any) => ({
        documentId: doc.documentId,
        documentType: doc.documentType || "Supporting Document",
        fileName: doc.fileName,
        fileUrl: doc.fileUrl || `/uploads/${doc.fileName}`,
        verificationStatus: "PENDING"
      })),
      verificationStatus: "PENDING",
      applicationHistory: [
        {
          status: "SUBMITTED",
          updatedBy: req.user?.fullName || "Farmer",
          remarks: "Application submitted with supporting documents.",
          timestamp: new Date()
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: { application: newApp }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit application." });
  }
}

export async function getMyApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmerId = req.user?._id;
    const applications = await Application.find({ farmerId })
      .populate("schemeId")
      .sort({ submittedDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { applications }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getApplicationById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const query: any = {
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { applicationId: id }]
    };

    // If farmer, restrict to their own application
    if (req.user?.role === "FARMER") {
      query.farmerId = req.user._id;
    }

    const application = await Application.findOne(query)
      .populate("farmerId", "fullName email mobile district landSize cropType farmerType annualIncome")
      .populate("schemeId");

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: { application }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["SUBMITTED", "PENDING", "UNDER_VERIFICATION", "APPROVED", "REJECTED", "CORRECTION_REQUIRED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid application status value." });
      return;
    }

    const application = await Application.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { applicationId: id }]
    });

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    application.status = status;
    application.adminRemarks = remarks || "";
    if (status === "APPROVED") {
      application.verificationStatus = "VERIFIED";
    } else if (status === "REJECTED") {
      application.verificationStatus = "REJECTED";
    } else if (status === "CORRECTION_REQUIRED") {
      application.verificationStatus = "CORRECTION_REQUIRED";
    }

    application.applicationHistory.push({
      status,
      updatedBy: req.user?.fullName || "Agriculture Admin",
      remarks: remarks || `Status updated to ${status}`,
      timestamp: new Date()
    });

    await application.save();

    // Log admin audit
    if (req.user?._id) {
      await AuditLog.create({
        adminId: req.user._id,
        action: `APPLICATION_${status}`,
        entityType: "APPLICATION",
        entityId: application.applicationId,
        details: { status, remarks }
      });
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: { application }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
