import mongoose from "mongoose";

const ReceptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ReceptionModel = mongoose.model("Reception", ReceptionSchema);
export default ReceptionModel;
