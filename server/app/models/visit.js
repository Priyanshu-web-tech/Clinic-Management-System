const mongoose = require("mongoose");
const { visitStatus } = require("../constant/constant");

const visitSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    visitNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(visitStatus),
      default: visitStatus.WAITING,
      index: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    symptoms: {
      type: String,
      default: "",
    },

    diagnosis: {
      type: String,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visit", visitSchema);
