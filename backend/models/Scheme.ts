import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IScheme extends MongooseDoc {
  schemeId: string;
  schemeName: string;
  schemeNameTamil?: string;
  governmentLevel: "Tamil Nadu Government" | "Central Government";
  department: string;
  category: string;
  description: string;
  descriptionTamil?: string;
  benefits: string;
  benefitsTamil?: string;
  eligibilityConditions: string[];
  minimumAge: number;
  maximumAge: number;
  gender: "All" | "Male" | "Female";
  incomeLimit: number | null; // null if no income limit
  occupation: string;
  education: string;
  socialCategory: string[]; // ['All'] or specific categories
  applicableDistricts: string[]; // ['All'] or specific districts
  landholdingMin: number;
  landholdingMax: number; // e.g. 5 acres, or 999 for no limit
  cropTypes: string[]; // ['All'] or specific crops
  farmingTypes: string[];
  irrigationRequirements: string[];
  applicableFarmerTypes: string[]; // ['All'] or ['Marginal', 'Small', etc.]
  studentRequired: boolean;
  farmerRequired: boolean;
  disabilityRequired: boolean;
  livestockRequirement: boolean;
  horticultureRequirement: boolean;
  machineryRequirement: boolean;
  requiredDocuments: string[];
  applicationProcess: string;
  applicationDeadline: string;
  officialWebsite: string;
  applicationUrl: string;
  status: "ACTIVE" | "DISABLED";
  lastVerifiedDate: Date;
  isDemonstrationData: boolean;
  verificationStatus?: string;
  schemeStatus?: string;
  exclusionCriteria?: string;
  otherConditions?: string;
  sourceType?: string;
  sourceTitle?: string;
  additionalNotes?: string;
  rawEligibilityText?: string;
  rawMinAge?: number | null;
  rawMaxAge?: number | null;
  rawAnnualIncomeLimit?: number | null;
  rawLandMinAcres?: number | null;
  rawLandMaxAcres?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const schemeSchema = new Schema<IScheme>(
  {
    schemeId: { type: String, required: true, unique: true, trim: true },
    schemeName: { type: String, required: true, trim: true },
    schemeNameTamil: { type: String, trim: true },
    governmentLevel: {
      type: String,
      enum: ["Tamil Nadu Government", "Central Government"],
      required: true
    },
    department: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    descriptionTamil: { type: String },
    benefits: { type: String, required: true },
    benefitsTamil: { type: String },
    eligibilityConditions: [{ type: String }],
    minimumAge: { type: Number, default: 18 },
    maximumAge: { type: Number, default: 80 },
    gender: { type: String, enum: ["All", "Male", "Female"], default: "All" },
    incomeLimit: { type: Number, default: null },
    occupation: { type: String, default: "Farmer / Agriculture" },
    education: { type: String, default: "Any" },
    socialCategory: [{ type: String, default: "All" }],
    applicableDistricts: [{ type: String, default: "All" }],
    landholdingMin: { type: Number, default: 0 },
    landholdingMax: { type: Number, default: 999 },
    cropTypes: [{ type: String, default: "All" }],
    farmingTypes: [{ type: String, default: "All" }],
    irrigationRequirements: [{ type: String, default: "All" }],
    applicableFarmerTypes: [{ type: String, default: "All" }],
    studentRequired: { type: Boolean, default: false },
    farmerRequired: { type: Boolean, default: true },
    disabilityRequired: { type: Boolean, default: false },
    livestockRequirement: { type: Boolean, default: false },
    horticultureRequirement: { type: Boolean, default: false },
    machineryRequirement: { type: Boolean, default: false },
    requiredDocuments: [{ type: String }],
    applicationProcess: { type: String, required: true },
    applicationDeadline: { type: String, default: "Ongoing / Per Financial Year" },
    officialWebsite: { type: String, required: true },
    applicationUrl: { type: String, default: "" },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
    lastVerifiedDate: { type: Date, default: Date.now },
    isDemonstrationData: { type: Boolean, default: false },
    verificationStatus: { type: String, default: "Requires verification" },
    schemeStatus: { type: String, default: "Requires verification" },
    exclusionCriteria: { type: String },
    otherConditions: { type: String },
    sourceType: { type: String },
    sourceTitle: { type: String },
    additionalNotes: { type: String },
    rawEligibilityText: { type: String },
    rawMinAge: { type: Number, default: null },
    rawMaxAge: { type: Number, default: null },
    rawAnnualIncomeLimit: { type: Number, default: null },
    rawLandMinAcres: { type: Number, default: null },
    rawLandMaxAcres: { type: Number, default: null }
  },
  { timestamps: true }
);

// Indexes
schemeSchema.index({ schemeName: 1 });
schemeSchema.index({ department: 1 });
schemeSchema.index({ category: 1 });
schemeSchema.index({ status: 1 });
schemeSchema.index({ governmentLevel: 1 });

export const Scheme = mongoose.model<IScheme>("Scheme", schemeSchema);
