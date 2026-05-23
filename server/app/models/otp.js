const mongoose = require("mongoose");
const { otpType } = require("../constant/constant");

const otpSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otp_type: {
      type: String,
      enum: Object.values(otpType),
      required: true,
    },
    otp_sent_at: {
      type: Number,
      default: Date.now,
    },
    otp_sent: {
      type: Number,
      default: 1,
    },
    otp_retries: {
      type: Number,
      default: 0,
    },
    last_attempt: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
