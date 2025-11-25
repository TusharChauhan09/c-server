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
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
