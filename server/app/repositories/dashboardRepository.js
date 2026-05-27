const Visit = require("../models/visit");
const Patient = require("../models/patient");
const Prescription = require("../models/prescription");
const User = require("../models/user");

const getVisitCounts = async ({ hospitalId, doctorId, dateRange, statuses }) => {
  const base = { hospital: hospitalId, createdAt: dateRange };
  if (doctorId) base.doctor = doctorId;

  const counts = await Promise.all(
    statuses.map((status) => Visit.countDocuments({ ...base, status })),
  );

  return statuses.reduce((acc, status, i) => {
    acc[status] = counts[i];
    return acc;
  }, {});
};

const getTotalPatients = (hospitalId) =>
  Patient.countDocuments({ hospital: hospitalId, isActive: true });

const getPrescriptionCount = (hospitalId, dateRange) =>
  Prescription.countDocuments({ hospital: hospitalId, createdAt: dateRange });

const getTotalPrescriptions = (hospitalId) =>
  Prescription.countDocuments({ hospital: hospitalId });

const getTotalStaff = (hospitalId, userType) =>
  User.countDocuments({ hospital: hospitalId, userType, isActive: true });

module.exports = {
  getVisitCounts,
  getTotalPatients,
  getPrescriptionCount,
  getTotalPrescriptions,
  getTotalStaff,
};
