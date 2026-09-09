export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: "FARMER" | "ADMIN";
  preferredLanguage: "en" | "ta";
  district: string;
  state: string;
  dateOfBirth?: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  farmerStatus: "Active" | "Owner" | "Tenant" | "Sharecropper";
  landOwnership: "Owned" | "Leased" | "Shared";
  landSize: number;
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
  createdAt?: string;
}

export interface SchemeItem {
  _id: string;
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
  incomeLimit: number | null;
  occupation: string;
  education: string;
  socialCategory: string[];
  applicableDistricts: string[];
  landholdingMin: number;
  landholdingMax: number;
  cropTypes: string[];
  farmingTypes: string[];
  irrigationRequirements: string[];
  applicableFarmerTypes: string[];
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
  lastVerifiedDate: string;
  isDemonstrationData: boolean;
}

export interface RecommendationResult {
  schemeId: string;
  schemeName: string;
  schemeNameTamil?: string;
  matchScore: number;
  whyRecommended: string[];
  governmentLevel: string;
  department: string;
  category: string;
  benefits: string;
  benefitsTamil?: string;
  description: string;
  requiredDocuments: string[];
  officialWebsite: string;
  applicationUrl: string;
  applicationDeadline: string;
  isDemonstrationData: boolean;
}

export interface ApplicationItem {
  _id: string;
  applicationId: string;
  farmerId: UserProfile | string;
  schemeId: SchemeItem;
  schemeCode: string;
  schemeName: string;
  submittedDate: string;
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
    timestamp: string;
  }>;
}

export interface DocumentItem {
  _id: string;
  documentId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUIRED";
  adminRemarks: string;
  farmerId?: UserProfile;
}

export interface NotificationItem {
  _id: string;
  title: string;
  titleTamil?: string;
  message: string;
  messageTamil?: string;
  audience: string;
  targetDistrict?: string;
  notificationType: string;
  createdAt: string;
  publishedBy?: { fullName: string };
  readBy?: string[];
}
