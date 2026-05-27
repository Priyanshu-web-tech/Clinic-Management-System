const mongoose = require("mongoose");
const {
  durationUnit: durationUnitConst,
  medicineTiming,
} = require("../constant/constant");

const prescriptionMedicineSchema = new mongoose.Schema(
  {
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
      index: true,
    },

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    durationValue: {
      type: Number,
      default: 1,
      min: 1,
    },

    durationUnit: {
      type: String,
      enum: Object.values(durationUnitConst),
      default: durationUnitConst.DAYS,
    },

    frequency: {
      morning: { type: Number, default: 0 },
      afternoon: { type: Number, default: 0 },
      night: { type: Number, default: 0 },
    },

    timing: {
      type: String,
      enum: Object.values(medicineTiming),
      default: medicineTiming.ANYTIME,
    },
  },
  { timestamps: true },
);


module.exports = mongoose.model(
  "PrescriptionMedicine",
  prescriptionMedicineSchema,
);
