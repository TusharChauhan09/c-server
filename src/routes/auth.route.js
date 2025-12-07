import express from "express";
import { getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", getCurrentUser);

export default router;
