// models/Order.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  eventType: { type: String, required: true },
  orderValue: { type: Number, required: true },
  productsOrdered: [{ productName: String, productPrice: Number, productCount: Number }],
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
