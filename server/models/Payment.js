const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cash', 'paypal', 'stripe', 'other'],
      default: 'bank_transfer',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    receipt: {
      type: String, // Cloudinary URL
    },
  },
  {
    timestamps: true,
  }
);

// After saving a payment, update project's amountPaid
paymentSchema.post('save', async function () {
  const Payment = this.constructor;
  const Project = mongoose.model('Project');

  const result = await Payment.aggregate([
    { $match: { project: this.project, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalPaid = result.length > 0 ? result[0].total : 0;
  await Project.findByIdAndUpdate(this.project, { amountPaid: totalPaid });
});

// Compound indexes
paymentSchema.index({ user: 1, paymentDate: -1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
