import { User } from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const { clerkId } = req.query;

    if (!clerkId) {
      return res.status(400).json({ success: false, message: "Clerk ID is required" });
    }

    let user = await User.findOne({ clerkId });

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

// Sync user from Clerk - creates user if not exists, updates if exists
export const syncUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, username, avatar } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ success: false, message: "Clerk ID and email are required" });
    }

    // Try to find existing user
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username || user.username;
      user.avatar = avatar || user.avatar;
      await user.save();
      console.log("✅ User updated:", user._id);
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        firstName,
        lastName,
        username: username || `user_${clerkId.slice(0, 8)}`,
        avatar,
        role: "traveller",
        subscriptionTier: "bronze",
        standardCredits: 0,
      });
      await user.save();
      console.log("✅ New user created:", user._id);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
