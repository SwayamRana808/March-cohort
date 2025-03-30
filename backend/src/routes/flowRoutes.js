import express from "express";
import { generateFlow } from "../services/aiService.js";
import { createClient } from '@supabase/supabase-js';
import Flow from '../models/Flow.js';
import User from '../models/User.js';
import { saveFlow, getFlows, getFlowCount, getFlowById, deleteFlow, testFlowData } from '../controllers/flowController.js';
// import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify Supabase token and get MongoDB user
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    
    // Find or create MongoDB user
    let dbUser = await User.findOne({ supabaseUserId: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        email: user.email,
        supabaseUserId: user.id,
        flows: []
      });
    }
    
    req.user = user;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Save flow
router.post('/save', verifyToken, saveFlow);

// Get user's flows
router.get('/my-flows', verifyToken, async (req, res) => {
  try {
    const flows = await Flow.find({ userId: req.dbUser._id }).sort({ updatedAt: -1 });
    res.json(flows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ error: 'Error fetching flows' });
  }
});

// Get specific flow
router.get('/getFlow/:id', verifyToken, getFlowById);

// Route: Generate WhatsApp Flow using OpenAI
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const flow = await generateFlow(prompt);
    res.json({ flow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's flow count
router.get('/count', verifyToken, getFlowCount);

// Delete flow
router.delete('/:id', verifyToken, deleteFlow);

// Test flow data submission
router.post('/test-data', verifyToken, testFlowData);

export default router;
