const mongoose = require("mongoose");
const { gender: genderConst, bloodGroup: bloodGroupConst } = require("../constant/constant");

const patientSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    patientCode: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    gender: {
      type: String,
      enum: Object.values(genderConst),
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    bloodGroup: {
      type: String,
      enum: [...Object.values(bloodGroupConst), null],
      default: null,
    },

    allergies: {
      type: [String],
      default: [],
    },

    chronicDiseases: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

patientSchema.index({ hospital: 1, patientCode: 1 }, { unique: true });
patientSchema.index({ hospital: 1, phone: 1 });

module.exports = mongoose.model("Patient", patientSchema);
