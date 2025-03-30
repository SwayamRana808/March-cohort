import mongoose from 'mongoose';

const whatsAppConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wabaId: {
    type: String,
    required: true,
    trim: true
  },
  accessToken: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
whatsAppConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const WhatsAppConfig = mongoose.model('WhatsAppConfig', whatsAppConfigSchema);

export default WhatsAppConfig; 