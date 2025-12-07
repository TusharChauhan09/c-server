import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["traveller", "seller", "admin"],
      default: "traveller",
    },
    avatar: {
      type: String,
    },
    subscriptionTier: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      default: "bronze",
    },
    // Credits for using the Standard GPT-4o model
    // 1 Credit = 1 Session (approx 2 mins)
    standardCredits: {
      type: Number,
      default: 0,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
