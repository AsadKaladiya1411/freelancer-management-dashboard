const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'active',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: get projects count for this client
clientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  count: true,
});

// Compound index for efficient queries
clientSchema.index({ user: 1, createdAt: -1 });
clientSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Client', clientSchema);
