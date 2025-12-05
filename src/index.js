import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from 'ws';
import http from 'http';

import connectDB from "./lib/db.js";
import webhookRoutes from "./routes/webhook.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import voiceAgentRoutes from "./routes/voiceAgent.route.js";
import { setupGeminiSocket } from "./controllers/geminiAgent.controller.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Allow multiple frontend ports for development
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

// Webhook routes must be defined BEFORE express.json() to allow raw body parsing
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", paymentRoutes);
app.use("/api/voice-agent", voiceAgentRoutes);

// Initialize WebSocket Server for Gemini
const wss = new WebSocketServer({ server });
setupGeminiSocket(wss);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server ready for Gemini`);
    console.log(`GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'YES (' + process.env.GEMINI_API_KEY.slice(0, 4) + '...)' : 'NO'}`);
    connectDB();
});