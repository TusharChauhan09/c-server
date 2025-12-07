import express from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Route for Clerk Webhooks
// MUST use express.raw() to capture the raw body for signature verification
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  handleClerkWebhook
);

export default router;
