import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Transport Networks",
        "City Resources",
        "Logistic Infrastructure",
        "Other",
      ],
      required: true,
    },
    location: {
      type: String, // e.g., "Central Station", "Sector 5"
      required: false,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    problemDescription: {
      type: String,
      required: true,
    },
    solutionProposal: {
      type: String,
      required: true,
    },
    impact: {
      type: String, // Expected impact/benefits
      required: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Accepted", "Implemented"],
      default: "Submitted",
    },
    votes: {
      type: Number,
      default: 0,
    },
    aiAnalysis: {
      feasibilityScore: { type: Number, default: 0 }, // 1-10
      impactScore: { type: Number, default: 0 }, // 1-10
      feedback: { type: String, default: "" },
      analyzed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Idea = mongoose.model("Idea", ideaSchema);
