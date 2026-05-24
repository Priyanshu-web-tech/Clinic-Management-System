const mongoose = require("mongoose");
const { otpType } = require("../constant/constant");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpType: {
      type: String,
      enum: Object.values(otpType),
      required: true,
    },
    otpSentAt: {
      type: Number,
      default: Date.now,
    },
    otpSent: {
      type: Number,
      default: 1,
    },
    otpRetries: {
      type: Number,
      default: 0,
    },
    lastAttempt: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
