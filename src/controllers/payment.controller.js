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
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);

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

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, amount, paymentType } = req.body;

    console.log("🔍 Payment verification request:", { 
      razorpay_order_id, 
      razorpay_payment_id,
      hasSignature: !!razorpay_signature
    });

    // Verify payment directly from Razorpay API
    let isPaymentValid = false;
    
    try {
      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      console.log("📋 Razorpay Payment:", {
        id: payment.id,
        status: payment.status,
        order_id: payment.order_id,
        amount: payment.amount / 100
      });
      
      // Check if payment is successful and matches the order
      if (payment.status === 'captured' && payment.order_id === razorpay_order_id) {
        isPaymentValid = true;
        console.log("✅ Payment verified via Razorpay API - CAPTURED");
      } else if (payment.status === 'authorized' && payment.order_id === razorpay_order_id) {
        // Auto-capture the payment if it's only authorized
        try {
          await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
          isPaymentValid = true;
          console.log("✅ Payment captured and verified");
        } catch (captureError) {
          // If capture fails, payment might already be captured
          if (captureError.error?.description?.includes('already been captured')) {
            isPaymentValid = true;
            console.log("✅ Payment was already captured");
          } else {
            console.error("Capture error:", captureError.error?.description);
          }
        }
      } else {
        console.log("❌ Payment status:", payment.status);
      }
    } catch (apiError) {
      console.error("❌ Razorpay API error:", apiError.error?.description || apiError.message);
      
      // Fallback to signature verification
      if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest("hex");
        
        if (expectedSignature === razorpay_signature) {
          isPaymentValid = true;
          console.log("✅ Payment verified via signature");
        }
      }
    }

    if (isPaymentValid) {
      // Update subscription if needed
      if (userId && (paymentType === 'subscription' || amount == 499 || amount == 999)) {
        try {
          const user = await User.findOne({ clerkId: userId });
          
          if (user) {
            let creditsToAdd = 0;
            let newTier = user.subscriptionTier;

            if (amount == 499) {
              newTier = 'silver';
              creditsToAdd = 10;
            } else if (amount == 999) {
              newTier = 'gold';
              creditsToAdd = 20;
            }

            user.subscriptionTier = newTier;
            user.standardCredits += creditsToAdd;
            user.subscriptionStatus = 'active';
            
            await user.save();
            console.log(`✅ User upgraded to ${newTier}`);
          }
        } catch (dbError) {
          console.error("Database error:", dbError.message);
        }
      }

      console.log("✅ Payment verification successful!");
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      console.error("❌ Payment verification failed");
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
