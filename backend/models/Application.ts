import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IApplication extends MongooseDoc {
  applicationId: string;
  farmerId: mongoose.Types.ObjectId;
  schemeId: mongoose.Types.ObjectId;
  schemeCode: string;
  schemeName: string;
  submittedDate: Date;
  status: "SUBMITTED" | "PENDING" | "UNDER_VERIFICATION" | "APPROVED" | "REJECTED" | "CORRECTION_REQUIRED";
  documents: Array<{
    documentId?: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    verificationStatus?: string;
  }>;
  adminRemarks: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUIRED";
  applicationHistory: Array<{
    status: string;
    updatedBy: string;
    remarks: string;
    timestamp: Date;
  }>;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: String, required: true, unique: true, uppercase: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    schemeId: { type: Schema.Types.ObjectId, ref: "Scheme", required: true },
    schemeCode: { type: String, required: true },
    schemeName: { type: String, required: true },
    submittedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["SUBMITTED", "PENDING", "UNDER_VERIFICATION", "APPROVED", "REJECTED", "CORRECTION_REQUIRED"],
      default: "SUBMITTED"
    },
    documents: [
      {
        documentId: { type: String },
        documentType: { type: String, required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        verificationStatus: { type: String, default: "PENDING" }
      }
    ],
    adminRemarks: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "CORRECTION_REQUIRED"],
      default: "PENDING"
    },
    applicationHistory: [
      {
        status: { type: String, required: true },
        updatedBy: { type: String, required: true },
        remarks: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Indexes
applicationSchema.index({ farmerId: 1 });
applicationSchema.index({ schemeId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedDate: -1 });

export const Application = mongoose.model<IApplication>("Application", applicationSchema);
