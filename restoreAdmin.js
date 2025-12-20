import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function restoreAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const email = "chauhantushar912@gmail.com";
    const user = await User.findOne({ email });

    if (user) {
      console.log(`Found user: ${user.email}, Role: ${user.role}`);
      user.role = "admin";
      await user.save();
      console.log(`✅ Updated user ${user.email} to ADMIN role.`);
    } else {
      console.log("User not found.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

restoreAdmin();
