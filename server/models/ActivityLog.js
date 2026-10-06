const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      default: 'System'
    },
    role: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
