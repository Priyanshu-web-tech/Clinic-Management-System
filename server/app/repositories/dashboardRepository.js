const Visit = require("../models/visit");
const Patient = require("../models/patient");
const Prescription = require("../models/prescription");
const User = require("../models/user");

const getVisitCounts = async ({
  hospitalId,
  doctorId,
  dateRange,
  statuses,
}) => {
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

const getVisitTrend = async ({ hospitalId, doctorId, start, end }) => {
  const match = {
    hospital: hospitalId,
    createdAt: { $gte: start, $lte: end },
    status: { $in: ["completed", "cancelled"] },
  };
  if (doctorId) match.doctor = doctorId;

  return Visit.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateTrunc: { date: "$createdAt", unit: "day" } },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
    {
      $densify: {
        field: "_id",
        range: { step: 1, unit: "day", bounds: [start, end] },
      },
    },
    {
      $addFields: {
        completed: { $ifNull: ["$completed", 0] },
        cancelled: { $ifNull: ["$cancelled", 0] },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: "%Y-%m-%d", date: "$_id" } },
        completed: 1,
        cancelled: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
};

module.exports = {
  getVisitCounts,
  getTotalPatients,
  getPrescriptionCount,
  getTotalPrescriptions,
  getTotalStaff,
  getVisitTrend,
};
