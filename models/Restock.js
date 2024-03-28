// models/Restock.js

import mongoose from "mongoose";

const restockSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  eventType: { type: String, required: true },
  restockValue: { type: Number, required: true },
  productsRestocked: [{ productName: String, productPrice: Number, productCount: Number }],
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Restock = mongoose.model('Restock', restockSchema);

module.exports = Restock;
