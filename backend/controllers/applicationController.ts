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

    const rawId = String(schemeId || "").trim();

    // 1. Case-insensitive and multi-field lookup
    let scheme = await Scheme.findOne({
      $or: [
        { _id: rawId.match(/^[0-9a-fA-F]{24}$/) ? rawId : null },
        { schemeId: rawId },
        { schemeId: rawId.toUpperCase() },
        { schemeId: rawId.toLowerCase() },
        { schemeName: rawId },
        { schemeName: new RegExp(`^${rawId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
      ].filter(Boolean)
    });

    // 2. Fallback check by schemeName or schemeCode from request body
    if (!scheme && req.body.schemeName) {
      scheme = await Scheme.findOne({
        $or: [
          { schemeName: req.body.schemeName },
          { schemeName: new RegExp(`^${req.body.schemeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
          { schemeId: req.body.schemeCode }
        ]
      });
    }

    // 3. If scheme is still not registered in Scheme master table, create it dynamically so it is tracked in admin portal
    if (!scheme) {
      const fallbackName = req.body.schemeName || rawId;
      const fallbackCode = req.body.schemeCode || rawId;
      scheme = await Scheme.create({
        schemeId: fallbackCode,
        schemeName: fallbackName,
        department: req.body.department || "Agriculture & Farmers Welfare Department",
        category: req.body.category || "Agricultural Welfare Subsidy",
        governmentLevel: req.body.governmentLevel || "Tamil Nadu Government",
        benefits: req.body.benefits || "Direct Benefit Transfer and subsidy assistance",
        applicationUrl: req.body.applicationUrl || req.body.officialWebsite || "https://tnagrisnet.tn.gov.in",
        officialWebsite: req.body.officialWebsite || req.body.applicationUrl || "https://tnagrisnet.tn.gov.in",
        status: "ACTIVE"
      });
    }

    // Check if duplicate active application exists for this scheme by this farmer
    const existing = await Application.findOne({
      farmerId,
      $or: [
        { schemeId: scheme._id },
        { schemeCode: scheme.schemeId }
      ],
      status: { $in: ["SUBMITTED", "PENDING", "UNDER_VERIFICATION", "APPROVED"] }
    });

    if (existing) {
      const redirectUrl = scheme.applicationUrl || scheme.officialWebsite || req.body.applicationUrl || req.body.officialWebsite || "https://tnagrisnet.tn.gov.in";
      res.status(200).json({
        success: true,
        message: `Existing application (${existing.applicationId}) logged in Admin Portal. Redirecting to official portal...`,
        data: {
          application: existing,
          redirectUrl
        }
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
          remarks: req.body.remarks || "Application submitted with supporting documents via farmer portal.",
          timestamp: new Date()
        }
      ]
    });

    // Also record in administrative security audit log
    await AuditLog.create({
      action: "APPLICATION_SUBMITTED",
      adminId: farmerId,
      entityType: "APPLICATION",
      entityId: String(newApp._id),
      details: {
        applicationId: newApp.applicationId,
        schemeName: scheme.schemeName,
        farmerName: req.user?.fullName
      }
    });

    const redirectUrl = scheme.applicationUrl || scheme.officialWebsite || req.body.applicationUrl || req.body.officialWebsite || "https://tnagrisnet.tn.gov.in";

    res.status(201).json({
      success: true,
      message: "Application recorded in Government portal successfully.",
      data: {
        application: newApp,
        redirectUrl
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit application." });
  }
}

export async function getMyApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmerId = req.user?._id;
    const filter = req.user?.role === "ADMIN" ? {} : { farmerId };
    const applications = await Application.find(filter)
      .populate("farmerId", "fullName email mobile district village farmerRegistrationId")
      .populate("schemeId")
      .sort({ submittedDate: -1, createdAt: -1 })
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
