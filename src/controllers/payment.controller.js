import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    console.log("Received order request:", { amount, currency });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys are missing");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Razorpay keys missing",
      });
    }

    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise for INR)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

import { User } from "../models/user.model.js";

// ... existing code ...

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      if (userId) {
         try {
             // Find user and update plan
             const user = await User.findOne({ clerkId: userId });
             
             if (user) {
                 // Determine plan based on amount (simple logic for now)
                 // Frontend sends amount in INR (e.g. 499 or 999)
                 let creditsToAdd = 0;
                 let newTier = user.subscriptionTier;

                 if (amount == 499) {
                     newTier = 'silver';
                     creditsToAdd = 10;
                 } else if (amount == 999) {
                     newTier = 'gold';
                     creditsToAdd = 20;
                 }

                 // Update user
                 user.subscriptionTier = newTier;
                 user.standardCredits += creditsToAdd; // Add to existing credits
                 user.subscriptionStatus = 'active';
                 
                 await user.save();
                 console.log(`✅ User ${userId} upgraded to ${newTier} with +${creditsToAdd} credits`);
             }
         } catch (dbError) {
             console.error("Database update failed after payment:", dbError);
             // Note: In production we should handle this more robustly (e.g. queue)
         }
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
