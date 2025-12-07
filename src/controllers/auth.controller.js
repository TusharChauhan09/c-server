import { User } from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const { clerkId } = req.query;

    if (!clerkId) {
      return res.status(400).json({ success: false, message: "Clerk ID is required" });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
