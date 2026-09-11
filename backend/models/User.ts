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
  block?: string;
  village?: string;
  dateOfBirth?: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  farmerStatus: "Active" | "Owner" | "Tenant" | "Sharecropper";
  landOwnership: "Owned" | "Leased" | "Shared";
  landOwnershipType?: "Own Land" | "Leased Land" | "Tenant Farmer" | "Sharecropper" | "Other";
  landSize: number; // in acres
  cultivableArea?: number;
  irrigatedArea?: number;
  rainfedArea?: number;
  pattaAvailable?: "Yes" | "No";
  surveyRecordAvailable?: "Yes" | "No";
  registeredLease?: "Yes" | "No" | "Not Applicable";
  leaseDuration?: string;
  registrationStatus?: "Registered" | "Not Registered" | "Don't Know";
  landType: string;
  cropType: string;
  secondaryCrop?: string;
  previousCrop?: string;
  primaryCropArea?: number;
  secondaryCropArea?: number;
  cropsPerYear?: number;
  sowingStatus?: "Planned" | "Sown" | "Growing" | "Harvested";
  cropInsuranceStatus?: "Currently Insured" | "Not Insured" | "Don't Know";
  previousCropLoss?: "Yes" | "No";
  farmingType: string;
  irrigationType: string;
  irrigationMethod?: "Flood" | "Drip" | "Sprinkler" | "Other";
  electricityAvailable?: "Yes" | "No";
  agriculturalElectricityConnection?: "Yes" | "No" | "Don't Know";
  pumpType?: "Electric" | "Diesel" | "Solar" | "None";
  existingSolarPump?: "Yes" | "No";
  dripAvailable?: "Yes" | "No";
  sprinklerAvailable?: "Yes" | "No";
  farmPondAvailable?: "Yes" | "No";
  bankAccountAvailable?: "Yes" | "No";
  dbtEnabled?: "Yes" | "No" | "Don't Know";
  bankAccountType?: "Individual" | "Joint" | "Other";
  farmerType: "Marginal" | "Small" | "Medium" | "Large";
  annualIncome: number;
  agriculturalIncome?: number;
  nonAgriculturalIncome?: number;
  socialCategory: "General" | "OBC" | "MBC" | "SC" | "ST";
  soilType?: string;
  croppingSeason?: string;
  pmKisanBeneficiary?: boolean;
  kisanCreditCard?: boolean;
  soilHealthCard?: boolean;
  solarPumpInterest?: boolean;
  differentlyAbled?: boolean;
  cowCount?: number;
  goatCount?: number;
  poultryCount?: number;
  dairyFarming?: "Yes" | "No";
  goatSheepFarming?: "Yes" | "No";
  poultryFarming?: "Yes" | "No";
  fisheries?: "Yes" | "No";
  beekeeping?: "Yes" | "No";
  sericulture?: "Yes" | "No";
  mushroomCultivation?: "Yes" | "No";
  agroforestry?: "Yes" | "No";
  horticultureType?: string;
  horticultureArea?: number;
  organicFarming?: "Yes" | "No" | "Planning to Adopt";
  organicCertificationStatus?: "Certified" | "Under Conversion" | "Not Certified" | "Not Applicable";
  naturalFarming?: "Yes" | "No";
  organicCertified?: boolean;
  livestockOwnership: boolean;
  horticultureActivity: boolean;
  machineryOwnership: boolean;
  machineryList?: string[];
  infrastructureList?: string[];
  subsidyReceived?: "Yes" | "No" | "Don't Know";
  previouslyReceivedBenefit?: "Yes" | "No";
  previouslyAppliedScheme?: "Yes" | "No";
  previousApplications?: Array<{
    schemeId: string;
    schemeName: string;
    applicationStatus: string;
    year: number;
    benefitReceived: string;
  }>;
  activeKCC?: "Yes" | "No";
  agriculturalLoan?: "Yes" | "No";
  cropInsurance?: "Yes" | "No" | "Don't Know";
  hasCropLoss?: "Yes" | "No";
  memberFPO?: "Yes" | "No";
  memberFIG?: "Yes" | "No";
  memberSHG?: "Yes" | "No";
  memberJLG?: "Yes" | "No";
  educationLevel?: string;
  agriTrainingReceived?: "Yes" | "No";
  agriTrainingType?: string;
  skillTraining?: "Yes" | "No";
  assistanceRequired?: string[];
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
    block: { type: String, default: "Thanjavur" },
    village: { type: String, default: "Vallam" },
    dateOfBirth: { type: String },
    age: { type: Number, default: 45 },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    farmerStatus: { type: String, enum: ["Active", "Owner", "Tenant", "Sharecropper"], default: "Owner" },
    landOwnership: { type: String, enum: ["Owned", "Leased", "Shared"], default: "Owned" },
    landOwnershipType: {
      type: String,
      enum: ["Own Land", "Leased Land", "Tenant Farmer", "Sharecropper", "Other"],
      default: "Own Land"
    },
    landSize: { type: Number, default: 2.5 },
    cultivableArea: { type: Number, default: 2.5 },
    irrigatedArea: { type: Number, default: 2.0 },
    rainfedArea: { type: Number, default: 0.5 },
    pattaAvailable: { type: String, enum: ["Yes", "No"], default: "Yes" },
    surveyRecordAvailable: { type: String, enum: ["Yes", "No"], default: "Yes" },
    registeredLease: { type: String, enum: ["Yes", "No", "Not Applicable"], default: "Not Applicable" },
    leaseDuration: { type: String, default: "" },
    registrationStatus: {
      type: String,
      enum: ["Registered", "Not Registered", "Don't Know"],
      default: "Registered"
    },
    landType: { type: String, default: "Wetland (Nanjai)" },
    cropType: { type: String, default: "Paddy" },
    secondaryCrop: { type: String, default: "Black Gram (Ulundu)" },
    previousCrop: { type: String, default: "Sesame (Ellu)" },
    primaryCropArea: { type: Number, default: 2.0 },
    secondaryCropArea: { type: Number, default: 0.5 },
    cropsPerYear: { type: Number, default: 2 },
    sowingStatus: {
      type: String,
      enum: ["Planned", "Sown", "Growing", "Harvested"],
      default: "Growing"
    },
    cropInsuranceStatus: {
      type: String,
      enum: ["Currently Insured", "Not Insured", "Don't Know"],
      default: "Not Insured"
    },
    previousCropLoss: { type: String, enum: ["Yes", "No"], default: "No" },
    farmingType: { type: String, default: "Conventional" },
    irrigationType: { type: String, default: "Canal" },
    irrigationMethod: {
      type: String,
      enum: ["Flood", "Drip", "Sprinkler", "Other"],
      default: "Flood"
    },
    electricityAvailable: { type: String, enum: ["Yes", "No"], default: "Yes" },
    agriculturalElectricityConnection: {
      type: String,
      enum: ["Yes", "No", "Don't Know"],
      default: "Yes"
    },
    pumpType: {
      type: String,
      enum: ["Electric", "Diesel", "Solar", "None"],
      default: "Electric"
    },
    existingSolarPump: { type: String, enum: ["Yes", "No"], default: "No" },
    dripAvailable: { type: String, enum: ["Yes", "No"], default: "No" },
    sprinklerAvailable: { type: String, enum: ["Yes", "No"], default: "No" },
    farmPondAvailable: { type: String, enum: ["Yes", "No"], default: "No" },
    bankAccountAvailable: { type: String, enum: ["Yes", "No"], default: "Yes" },
    dbtEnabled: { type: String, enum: ["Yes", "No", "Don't Know"], default: "Yes" },
    bankAccountType: {
      type: String,
      enum: ["Individual", "Joint", "Other"],
      default: "Individual"
    },
    farmerType: { type: String, enum: ["Marginal", "Small", "Medium", "Large"], default: "Small" },
    annualIncome: { type: Number, default: 120000 },
    agriculturalIncome: { type: Number, default: 95000 },
    nonAgriculturalIncome: { type: Number, default: 25000 },
    socialCategory: { type: String, enum: ["General", "OBC", "MBC", "SC", "ST"], default: "OBC" },
    soilType: { type: String, default: "Alluvial / Loamy" },
    croppingSeason: { type: String, default: "Samba" },
    pmKisanBeneficiary: { type: Boolean, default: false },
    kisanCreditCard: { type: Boolean, default: false },
    soilHealthCard: { type: Boolean, default: false },
    solarPumpInterest: { type: Boolean, default: false },
    differentlyAbled: { type: Boolean, default: false },
    cowCount: { type: Number, default: 0 },
    goatCount: { type: Number, default: 0 },
    poultryCount: { type: Number, default: 0 },
    dairyFarming: { type: String, enum: ["Yes", "No"], default: "No" },
    goatSheepFarming: { type: String, enum: ["Yes", "No"], default: "No" },
    poultryFarming: { type: String, enum: ["Yes", "No"], default: "No" },
    fisheries: { type: String, enum: ["Yes", "No"], default: "No" },
    beekeeping: { type: String, enum: ["Yes", "No"], default: "No" },
    sericulture: { type: String, enum: ["Yes", "No"], default: "No" },
    mushroomCultivation: { type: String, enum: ["Yes", "No"], default: "No" },
    agroforestry: { type: String, enum: ["Yes", "No"], default: "No" },
    horticultureType: {
      type: String,
      enum: ["None", "Fruits", "Vegetables", "Flowers", "Spices", "Plantation Crops", "Other"],
      default: "None"
    },
    horticultureArea: { type: Number, default: 0 },
    organicFarming: {
      type: String,
      enum: ["Yes", "No", "Planning to Adopt"],
      default: "No"
    },
    organicCertificationStatus: {
      type: String,
      enum: ["Certified", "Under Conversion", "Not Certified", "Not Applicable"],
      default: "Not Applicable"
    },
    naturalFarming: { type: String, enum: ["Yes", "No"], default: "No" },
    organicCertified: { type: Boolean, default: false },
    livestockOwnership: { type: Boolean, default: false },
    horticultureActivity: { type: Boolean, default: false },
    machineryOwnership: { type: Boolean, default: false },
    machineryList: [{ type: String }],
    infrastructureList: [{ type: String }],
    subsidyReceived: { type: String, enum: ["Yes", "No", "Don't Know"], default: "No" },
    previouslyReceivedBenefit: { type: String, enum: ["Yes", "No"], default: "No" },
    previouslyAppliedScheme: { type: String, enum: ["Yes", "No"], default: "No" },
    previousApplications: [
      {
        schemeId: { type: String },
        schemeName: { type: String },
        applicationStatus: { type: String },
        year: { type: Number },
        benefitReceived: { type: String }
      }
    ],
    activeKCC: { type: String, enum: ["Yes", "No"], default: "No" },
    agriculturalLoan: { type: String, enum: ["Yes", "No"], default: "No" },
    cropInsurance: { type: String, enum: ["Yes", "No", "Don't Know"], default: "No" },
    hasCropLoss: { type: String, enum: ["Yes", "No"], default: "No" },
    memberFPO: { type: String, enum: ["Yes", "No"], default: "No" },
    memberFIG: { type: String, enum: ["Yes", "No"], default: "No" },
    memberSHG: { type: String, enum: ["Yes", "No"], default: "No" },
    memberJLG: { type: String, enum: ["Yes", "No"], default: "No" },
    educationLevel: { type: String, default: "Higher Secondary" },
    agriTrainingReceived: { type: String, enum: ["Yes", "No"], default: "No" },
    agriTrainingType: { type: String, default: "" },
    skillTraining: { type: String, enum: ["Yes", "No"], default: "No" },
    assistanceRequired: [{ type: String }],
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
