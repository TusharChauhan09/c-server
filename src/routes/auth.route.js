import express from "express";
import { getCurrentUser, syncUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", getCurrentUser);
router.post("/sync", syncUser);

export default router;
