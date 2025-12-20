import express from "express";
import axios from "axios";
import { Idea } from "../models/idea.model.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Get all ideas ( Public Gallery )
router.get("/", async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate("userId", "firstName lastName avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Submit a new idea
router.post("/", async (req, res) => {
  try {
    const {
      clerkId,
      title,
      category,
      problemDescription,
      solutionProposal,
      impact,
      location,
      coordinates,
    } = req.body;

    if (
      !clerkId ||
      !title ||
      !category ||
      !problemDescription ||
      !solutionProposal
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

    // AI Analysis
    let aiAnalysis = {
      feasibilityScore: 0,
      impactScore: 0,
      feedback: "Analysis failed or skipped.",
      analyzed: false,
    };

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `
          Analyze this city improvement idea:
          Title: ${title}
          Category: ${category}
          Problem: ${problemDescription}
          Solution: ${solutionProposal}
          
          Provide a JSON object with:
          - feasibilityScore (1-10 integer)
          - impactScore (1-10 integer)
          - feedback (short 1-sentence summary of pros/cons)
          Do not include markdown formatting, just raw JSON.
        `;

        const aiRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          },
          {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          }
        );

        const content = aiRes.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        aiAnalysis = {
          feasibilityScore: parsed.feasibilityScore || 5,
          impactScore: parsed.impactScore || 5,
          feedback: parsed.feedback || "AI provided no specific feedback.",
          analyzed: true,
        };
      } catch (aiErr) {
        console.error("AI Analysis Error:", aiErr.message);
      }
    }

    const newIdea = new Idea({
      userId: user._id,
      title,
      category,
      problemDescription,
      solutionProposal,
      impact,
      aiAnalysis,
      location,
      coordinates,
    });

    await newIdea.save();

    res.status(201).json({
      success: true,
      message: "Idea submitted successfully!",
      data: newIdea,
    });
  } catch (error) {
    console.error("Error submitting idea:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Upvote an idea (Mock implementation for now)
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true }
    );
    res.status(200).json({ success: true, data: idea });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error voting" });
  }
});

// Update idea status (Admin)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status enum
    const validStatuses = [
      "Submitted",
      "Under Review",
      "Accepted",
      "Implemented",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const idea = await Idea.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: idea });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});

export default router;
