import mongoose, { Schema, Document as MongooseDoc } from "mongoose";

export interface IRecommendation extends MongooseDoc {
  farmerId: mongoose.Types.ObjectId;
  farmerProfileSnapshot: Record<string, any>;
  recommendations: Array<{
    schemeId: string;
    schemeName: string;
    matchScore: number;
    whyRecommended: string[];
    governmentLevel: string;
    department: string;
    benefits: string;
    requiredDocuments: string[];
  }>;
  createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    farmerProfileSnapshot: { type: Object, required: true },
    recommendations: [
      {
        schemeId: { type: String, required: true },
        schemeName: { type: String, required: true },
        matchScore: { type: Number, required: true },
        whyRecommended: [{ type: String }],
        governmentLevel: { type: String },
        department: { type: String },
        benefits: { type: String },
        requiredDocuments: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

recommendationSchema.index({ farmerId: 1, createdAt: -1 });

export const Recommendation = mongoose.model<IRecommendation>("Recommendation", recommendationSchema);
