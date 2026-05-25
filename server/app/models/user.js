const mongoose = require("mongoose");
const { userType, designation } = require("../constant/constant");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: Object.values(userType),
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      enum: [...Object.values(designation), null],
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null, // allowed for global users - admin
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
