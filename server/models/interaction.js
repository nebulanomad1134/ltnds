const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: { type: String, required: true }, // e.g., 'view', 'click'
  timestamp: { type: Date, required: true }
});

module.exports = mongoose.model('Interaction', InteractionSchema);
