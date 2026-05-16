const mongoose = require('mongoose');

const testSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    analysisType: {
      type: String,
      enum: ['Génération de script', 'Exécution'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    report: {
      type: Object, // Stores the JSON report from FastAPI
      default: null,
    },
    screenshots: [
      {
        url: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    logs: [
      {
        message: String,
        level: { type: String, enum: ['info', 'error', 'warning'], default: 'info' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Test', testSchema);
