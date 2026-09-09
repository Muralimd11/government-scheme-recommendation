import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IUser extends MongooseDoc {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: "FARMER" | "ADMIN";
  preferredLanguage: "en" | "ta";
  district: string;
  state: string;
  dateOfBirth?: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  farmerStatus: "Active" | "Owner" | "Tenant" | "Sharecropper";
  landOwnership: "Owned" | "Leased" | "Shared";
  landSize: number; // in acres
  landType: string;
  cropType: string;
  farmingType: string;
  irrigationType: string;
  farmerType: "Marginal" | "Small" | "Medium" | "Large";
  annualIncome: number;
  socialCategory: "General" | "OBC" | "MBC" | "SC" | "ST";
  livestockOwnership: boolean;
  horticultureActivity: boolean;
  machineryOwnership: boolean;
  farmerRegistrationId?: string;
  accountStatus: "ACTIVE" | "DISABLED";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["FARMER", "ADMIN"], default: "FARMER" },
    preferredLanguage: { type: String, enum: ["en", "ta"], default: "en" },
    district: { type: String, default: "Thanjavur" },
    state: { type: String, default: "Tamil Nadu" },
    dateOfBirth: { type: String },
    age: { type: Number, default: 45 },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    farmerStatus: { type: String, enum: ["Active", "Owner", "Tenant", "Sharecropper"], default: "Owner" },
    landOwnership: { type: String, enum: ["Owned", "Leased", "Shared"], default: "Owned" },
    landSize: { type: Number, default: 2.5 },
    landType: { type: String, default: "Wetland (Nanjai)" },
    cropType: { type: String, default: "Paddy" },
    farmingType: { type: String, default: "Conventional" },
    irrigationType: { type: String, default: "Canal" },
    farmerType: { type: String, enum: ["Marginal", "Small", "Medium", "Large"], default: "Small" },
    annualIncome: { type: Number, default: 120000 },
    socialCategory: { type: String, enum: ["General", "OBC", "MBC", "SC", "ST"], default: "OBC" },
    livestockOwnership: { type: Boolean, default: false },
    horticultureActivity: { type: Boolean, default: false },
    machineryOwnership: { type: Boolean, default: false },
    farmerRegistrationId: { type: String },
    accountStatus: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ district: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
