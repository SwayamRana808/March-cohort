import express from "express";
import { generateFlow } from "../services/aiService.js";

const router = express.Router();

// Route: Generate WhatsApp Flow using OpenAI
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const flow = await generateFlow(prompt);
    console.log(flow);
    res.json({ flow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
