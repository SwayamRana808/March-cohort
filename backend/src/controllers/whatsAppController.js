import WhatsAppConfig from '../models/WhatsAppConfig.js';
import { createClient } from '@supabase/supabase-js';
import User from '../models/User.js';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const saveWhatsAppConfig = async (req, res) => {
  try {
    const { wabaId, accessToken } = req.body;
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

    // Check if config already exists
    let config = await WhatsAppConfig.findOne({ userId: dbUser._id });

    if (config) {
      // Update existing config
      config.wabaId = wabaId;
      config.accessToken = accessToken;
      await config.save();
    } else {
      // Create new config
      config = await WhatsAppConfig.create({
        userId: dbUser._id,
        wabaId,
        accessToken
      });
    }

    res.json({
      message: 'WhatsApp configuration saved successfully',
      config: {
        wabaId: config.wabaId,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    res.status(500).json({ message: 'Error saving WhatsApp configuration', error: error.message });
  }
};

export const getWhatsAppConfig = async (req, res) => {
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

    const config = await WhatsAppConfig.findOne({ userId: dbUser._id });

    if (!config) {
      return res.status(404).json({ message: 'WhatsApp configuration not found' });
    }

    res.json({
      wabaId: config.wabaId,
      accessToken: config.accessToken,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    res.status(500).json({ message: 'Error fetching WhatsApp configuration', error: error.message });
  }
};

export const deleteWhatsAppConfig = async (req, res) => {
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

    const config = await WhatsAppConfig.findOneAndDelete({ userId: dbUser._id });

    if (!config) {
      return res.status(404).json({ message: 'WhatsApp configuration not found' });
    }

    res.json({ message: 'WhatsApp configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting WhatsApp config:', error);
    res.status(500).json({ message: 'Error deleting WhatsApp configuration', error: error.message });
  }
}; 