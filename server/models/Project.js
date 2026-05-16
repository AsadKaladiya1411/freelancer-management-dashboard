const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0,
    },
    amountPaid: {
      type: Number,
      min: [0, 'Amount paid cannot be negative'],
      default: 0,
    },
    deadline: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    milestones: [
      {
        title: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: calculate progress percentage
projectSchema.virtual('progress').get(function () {
  if (!this.budget || this.budget === 0) return 0;
  return Math.min(Math.round((this.amountPaid / this.budget) * 100), 100);
});

// Virtual: is overdue
projectSchema.virtual('isOverdue').get(function () {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== 'completed';
});

// Compound indexes
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, status: 1 });
projectSchema.index({ client: 1 });

module.exports = mongoose.model('Project', projectSchema);
