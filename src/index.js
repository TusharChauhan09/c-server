import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./lib/db.js";
import webhookRoutes from "./routes/webhook.route.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Webhook routes must be defined BEFORE express.json() to allow raw body parsing
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});