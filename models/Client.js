const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    company: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
