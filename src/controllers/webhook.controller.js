import { Webhook } from "svix";
import { User } from "../models/user.model.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    // Get the headers and body
    const headers = req.headers;
    
    // Convert Buffer to string for Svix verification
    const payload = req.body.toString('utf8');

    // Get the Svix headers for verification
    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.log("❌ Missing Svix headers");
      return res.status(400).json({
        success: false,
        message: "Error occured -- no svix headers",
      });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Attempt to verify the incoming webhook
    // If successful, the payload will be available from 'evt'
    // If the verification fails, throw an error
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.log("❌ Error verifying webhook:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`✅ Webhook received - ID: ${id}, Type: ${eventType}`);

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

      console.log("📝 Creating new user with data:", {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        username: username || `user_${id.slice(0, 5)}`,
      });

      const user = new User({
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username || `user_${id.slice(0, 5)}`, // Fallback username
        firstName: first_name,
        lastName: last_name,
        avatar: image_url,
      });

      await user.save();
      console.log("✅ User created successfully in MongoDB:", user._id);
    } else if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0].email_address,
          username: username,
          firstName: first_name,
          lastName: last_name,
          avatar: image_url,
        },
        { new: true }
      );
      console.log("✅ User updated in MongoDB:", updatedUser?._id || "NOT FOUND");
    } else if (eventType === "user.deleted") {
      const { id } = evt.data;
      const deletedUser = await User.findOneAndDelete({ clerkId: id });
      console.log("✅ User deleted from MongoDB:", deletedUser?._id || "NOT FOUND");
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.log("Error handling webhook:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
