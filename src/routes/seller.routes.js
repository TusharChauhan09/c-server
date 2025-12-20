import express from "express";
import { User } from "../models/user.model.js";
import { SellerRequest } from "../models/sellerRequest.model.js";

const router = express.Router();

// Get current user's seller request status
router.get("/status", async (req, res) => {
  try {
    const { clerkId } = req.query; // Assuming clerkId is passed as query param for now, ideally from auth middleware

    if (!clerkId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const request = await SellerRequest.findOne({ userId: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Error fetching seller status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new seller request
router.post("/request", async (req, res) => {
  try {
    const {
      clerkId,
      businessName,
      businessType,
      description,
      serviceLocation,
    } = req.body;

    if (
      !clerkId ||
      !businessName ||
      !businessType ||
      !description ||
      !serviceLocation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user already has a pending or approved request
    const existingRequest = await SellerRequest.findOne({
      userId: user._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingRequest.status} request.`,
      });
    }

    const newRequest = new SellerRequest({
      userId: user._id,
      businessName,
      businessType,
      description,
      serviceLocation,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Seller request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error submitting seller request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin: Get all requests
router.get("/admin/requests", async (req, res) => {
  try {
    // In a real app, verify admin role here
    const requests = await SellerRequest.find()
      .populate("userId", "username email firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin: Approve or Reject request
router.put("/admin/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminComments } = req.body;

    console.log(`[DEBUG] Updating request ${requestId} to status ${status}`);

    // Allow updating details without changing status (which defaults to pending)
    if (!["pending", "approved", "rejected"].includes(status)) {
      console.log(`[DEBUG] Invalid status: ${status}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid status update" });
    }

    const request = await SellerRequest.findById(requestId);
    if (!request) {
      console.log(`[DEBUG] Request not found for ID: ${requestId}`);
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    request.status = status;
    request.adminComments = adminComments;
    await request.save();

    console.log(
      `[DEBUG] Request saved. Status: ${status}. Updating user role if needed.`
    );

    // If approved, update user role to 'seller' ONLY if not admin
    if (status === "approved") {
      const user = await User.findById(request.userId);
      if (user && user.role !== "admin") {
        user.role = "seller";
        await user.save();
        console.log(`[DEBUG] User role updated to seller for ${user._id}`);
      } else {
        console.log(
          `[DEBUG] Skipped role update for user ${user?._id} (Current role: ${user?.role})`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
