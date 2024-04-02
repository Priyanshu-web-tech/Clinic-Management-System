import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema({
  productId: String,
  eventType: String,
  quantity: Number,
  timestamp: { type: Date, default: Date.now },
});
const AnalyticsEvent = mongoose.model("Analytics", AnalyticsEventSchema);

export default AnalyticsEvent;
