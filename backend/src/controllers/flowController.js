import Flow from '../models/Flow.js';
import User from '../models/User.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const saveFlow = async (req, res) => {
  try {
    const { flowName, flowData, flowId } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find or create user
    let dbUser = await User.findOne({ supabaseUserId: user.id });
    
    if (!dbUser) {
      dbUser = await User.create({
        email: user.email,
        supabaseUserId: user.id,
        flows: []
      });
    }

    let flow;
    if (flowId) {
      // Update existing flow
      flow = await Flow.findOne({ 
        _id: flowId,
        userId: dbUser._id 
      });

      if (!flow) {
        return res.status(404).json({ message: 'Flow not found' });
      }

      // Update the flow
      flow.flowName = flowName;
      flow.flowData = flowData;
      flow.updatedAt = new Date();
      await flow.save();
    } else {
      // Create new flow
      flow = await Flow.create({
        userId: dbUser._id,
        flowName,
        flowData
      });

      // Add flow to user's flows array
      dbUser.flows.push(flow._id);
      await dbUser.save();
    }

    res.status(201).json({
      message: flowId ? 'Flow updated successfully' : 'Flow saved successfully',
      flowId: flow._id
    });
  } catch (error) {
    console.error('Error saving flow:', error);
    res.status(500).json({ message: 'Error saving flow', error: error.message });
  }
};

export const getFlows = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user and populate their flows
    const dbUser = await User.findOne({ supabaseUserId: user.id })
      .populate('flows');

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(dbUser.flows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ message: 'Error fetching flows', error: error.message });
  }
};

export const getFlowCount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
     
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
     
    // Find user and get their flows count
    const dbUser = await User.findOne({ "supabaseUserId": String(user.id)});

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ count: dbUser.flows.length });
  } catch (error) {
    console.error('Error fetching flow count:', error);
    res.status(500).json({ message: 'Error fetching flow count', error: error.message });
  }
};

export const getFlowById = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find the MongoDB user first
    const dbUser = await User.findOne({ supabaseUserId: user.id });
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const flowId = req.params.id;

    // Find the flow and ensure it belongs to the user
    const flow = await Flow.findOne({ 
      _id: flowId,
      userId: dbUser._id  // Use MongoDB user ID instead of Supabase user ID
    });

    if (!flow) {
      return res.status(404).json({ message: 'Flow not found' });
    }

    res.json({
      flowName: flow.flowName, // Changed from name to flowName to match the model
      flowData: flow.flowData,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt
    });
  } catch (error) {
    console.error('Error fetching flow:', error);
    res.status(500).json({ message: 'Error fetching flow', error: error.message });
  }
};

export const deleteFlow = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find the MongoDB user first
    const dbUser = await User.findOne({ supabaseUserId: user.id });
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const flowId = req.params.id;

    // Find and delete the flow
    const flow = await Flow.findOneAndDelete({ 
      _id: flowId,
      userId: dbUser._id 
    });

    if (!flow) {
      return res.status(404).json({ message: 'Flow not found' });
    }

    // Remove flow from user's flows array
    dbUser.flows = dbUser.flows.filter(id => id.toString() !== flowId);
    await dbUser.save();

    res.json({ message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('Error deleting flow:', error);
    res.status(500).json({ message: 'Error deleting flow', error: error.message });
  }
};

export const testFlowData = async (req, res) => {
  try {
    const { flowId, screenId, formData } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find the MongoDB user
    const dbUser = await User.findOne({ supabaseUserId: user.id });
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the flow
    const flow = await Flow.findOne({ 
      _id: flowId,
      userId: dbUser._id 
    });

    if (!flow) {
      return res.status(404).json({ message: 'Flow not found' });
    }

    // Log the received data for testing
    console.log('Received Flow Data:', {
      flowId,
      screenId,
      formData,
      timestamp: new Date().toISOString()
    });

    // For now, just return success with the received data
    res.status(200).json({
      message: 'Flow data received successfully',
      data: {
        flowId,
        screenId,
        formData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error testing flow data:', error);
    res.status(500).json({ 
      message: 'Error processing flow data', 
      error: error.message 
    });
  }
}; 