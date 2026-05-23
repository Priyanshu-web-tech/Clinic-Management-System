const mongoose = require("mongoose");
const { userType, userStatus } = require("../constant/constant");

const userSchema = new mongoose.Schema(
  {
    user_type: {
      type: String,
      enum: Object.values(userType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(userStatus),
      default: userStatus.ACTIVE,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
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
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
