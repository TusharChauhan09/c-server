import express from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller.js";
import bodyParser from "body-parser";

const router = express.Router();

// Route for Clerk Webhooks
// MUST use bodyParser.raw() to capture the raw body for signature verification
router.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }),
  handleClerkWebhook
);

export default router;
