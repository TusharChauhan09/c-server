import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from 'http';
import path from 'path';

import connectDB from "./lib/db.js";
import webhookRoutes from "./routes/webhook.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import voiceAgentRoutes from "./routes/voiceAgent.route.js";
import authRoutes from "./routes/auth.route.js";

// Explicitly load .env from the server root
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log("-----------------------------------");
console.log("📂 CWD:", process.cwd());
console.log("📄 Env File Path:", path.join(process.cwd(), '.env'));
console.log("🔑 OPENAI_API_KEY Status:", process.env.OPENAI_API_KEY ? "Loaded (First 5: " + process.env.OPENAI_API_KEY.substring(0,5) + ")" : "MISSING");
console.log("-----------------------------------");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS configuration for development and production
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:5174", // Alternative local port
  process.env.FRONTEND_URL, // Production frontend URL (set in .env)
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Webhook routes must be defined BEFORE express.json() to allow raw body parsing
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/voice-agent", voiceAgentRoutes);

// Initialize WebSocket Server for Gemini

// Initialize WebSocket Server (Optional: if needed for other features)
// const wss = new WebSocketServer({ server });

server.on('upgrade', (request, socket, head) => {
  // console.log('📡 WebSocket Upgrade Request received:', request.url);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});