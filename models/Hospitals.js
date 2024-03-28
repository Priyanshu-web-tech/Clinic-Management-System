import mongoose from "mongoose";

const HospitalsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    accessCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const HospitalModel = mongoose.model("Hospital", HospitalsSchema);
export default HospitalModel;
