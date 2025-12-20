import mongoose from "mongoose";

const sellerRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ["hotel", "transport", "guide", "restaurant"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    serviceLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComments: {
      type: String,
    },
  },
  { timestamps: true }
);

export const SellerRequest = mongoose.model(
  "SellerRequest",
  sellerRequestSchema
);
