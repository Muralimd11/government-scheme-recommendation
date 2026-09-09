import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface INotification extends MongooseDoc {
  title: string;
  titleTamil?: string;
  message: string;
  messageTamil?: string;
  audience: "ALL_FARMERS" | "DISTRICT" | "SCHEME_ELIGIBLE" | "FARMER_TYPE";
  targetDistrict?: string;
  schemeId?: mongoose.Types.ObjectId;
  notificationType: "SCHEME_UPDATE" | "APPLICATION_STATUS" | "WEATHER_ADVISORY" | "DEADLINE_ALERT" | "SYSTEM";
  publishedBy: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    titleTamil: { type: String },
    message: { type: String, required: true },
    messageTamil: { type: String },
    audience: {
      type: String,
      enum: ["ALL_FARMERS", "DISTRICT", "SCHEME_ELIGIBLE", "FARMER_TYPE"],
      default: "ALL_FARMERS"
    },
    targetDistrict: { type: String, default: "" },
    schemeId: { type: Schema.Types.ObjectId, ref: "Scheme" },
    notificationType: {
      type: String,
      enum: ["SCHEME_UPDATE", "APPLICATION_STATUS", "WEATHER_ADVISORY", "DEADLINE_ALERT", "SYSTEM"],
      default: "SYSTEM"
    },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ audience: 1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
