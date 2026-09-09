import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IAuditLog extends MongooseDoc {
  adminId: mongoose.Types.ObjectId;
  action: string;
  entityType: "SCHEME" | "APPLICATION" | "DOCUMENT" | "USER" | "SYSTEM";
  entityId: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["SCHEME", "APPLICATION", "DOCUMENT", "USER", "SYSTEM"],
      required: true
    },
    entityId: { type: String, required: true },
    details: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ adminId: 1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
