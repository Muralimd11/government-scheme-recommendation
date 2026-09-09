import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DocumentModel } from "../models/Document";
import fs from "fs";
import path from "path";

export async function uploadDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No document file was uploaded." });
      return;
    }

    const farmerId = req.user?._id;
    const { documentType, applicationId } = req.body;

    const randomDocId = `DOC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newDoc = await DocumentModel.create({
      documentId: randomDocId,
      farmerId,
      applicationId: applicationId || null,
      documentType: documentType || "Land Document",
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      verificationStatus: "PENDING"
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        document: {
          documentId: newDoc.documentId,
          documentType: newDoc.documentType,
          fileName: newDoc.fileName,
          fileUrl: `/uploads/${newDoc.filePath}`,
          fileSize: newDoc.fileSize,
          mimeType: newDoc.mimeType,
          uploadedAt: newDoc.uploadedAt,
          verificationStatus: newDoc.verificationStatus
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to upload document." });
  }
}

export async function getMyDocuments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const farmerId = req.user?._id;
    const docs = await DocumentModel.find({ farmerId }).sort({ uploadedAt: -1 }).lean();

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

export async function deleteDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const farmerId = req.user?._id;

    const doc = await DocumentModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { documentId: id }],
      farmerId
    });

    if (!doc) {
      res.status(404).json({ success: false, message: "Document not found or access denied." });
      return;
    }

    // Attempt to remove local file
    try {
      const fullPath = path.join(process.cwd(), "uploads", doc.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.warn("[Document Controller] Error deleting file from disk:", e);
    }

    await doc.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
