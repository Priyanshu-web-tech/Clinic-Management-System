import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
    dob: Date,
    occupation: String,
    gender: String,
    maritalStatus: String,
    hospitalName: {
      type: String,
      required: true,
    },
    medStatus: { type: String, default: "FULLFILLED" },
    medicalHistory: [
      {
        remarks: { type: String, default: "" },
        prescription: { type: String, default: "" },
        date: { type: Date, default: Date.now },
      },
    ],
    queueNumber: {type:Number,default:null},
    queueDates: [{ type: Date }],
    receptionAmount: { type: String, default: null },
    medAmount: { type: String, default: null }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
