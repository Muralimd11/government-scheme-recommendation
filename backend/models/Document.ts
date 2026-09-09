import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IDocument extends MongooseDoc {
  documentId: string;
  farmerId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUIRED";
  adminRemarks: string;
}

const documentSchema = new Schema<IDocument>(
  {
    documentId: { type: String, required: true, unique: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    documentType: {
      type: String,
      required: true,
      enum: [
        "Land Document",
        "Income Certificate",
        "Community Certificate",
        "Farmer Registration/Certificate",
        "Bank-related Document",
        "Aadhaar Card",
        "Other"
      ],
      default: "Land Document"
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "CORRECTION_REQUIRED"],
      default: "PENDING"
    },
    adminRemarks: { type: String, default: "" }
  },
  { timestamps: true }
);

documentSchema.index({ farmerId: 1 });
documentSchema.index({ applicationId: 1 });
documentSchema.index({ verificationStatus: 1 });

export const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);
