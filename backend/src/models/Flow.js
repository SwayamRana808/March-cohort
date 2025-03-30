import mongoose from 'mongoose';

const flowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flowName: {
    type: String,
    required: true
  },
  flowData: {
    type: Object,
    required: true
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
flowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Flow = mongoose.model('Flow', flowSchema);

export default Flow; 