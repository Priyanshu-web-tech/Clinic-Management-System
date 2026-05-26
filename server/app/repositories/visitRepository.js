const Visit = require("../models/visit");
const Patient = require("../models/patient");

const findVisits = async ({ filter, search, page, pageSize, sortByDate = false }) => {
  if (search) {
    const regex = new RegExp(search, "i");
    const matchingPatients = await Patient.find({
      $or: [{ firstName: regex }, { lastName: regex }, { patientCode: regex }],
    }).select("_id");
    filter.patient = { $in: matchingPatients.map((p) => p._id) };
  }
  const limit = pageSize || 20;
  const skip = ((page || 1) - 1) * limit;

  const sortStage = sortByDate
    ? { $sort: { createdAt: -1 } }
    : {
        $sort: {
          _statusOrder: 1,
          tokenNumber: 1,
        },
      };

  const pipeline = [{ $match: filter }];

  if (!sortByDate) {
    pipeline.push({
      $addFields: {
        _statusOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "in_consultation"] }, then: 0 },
              { case: { $eq: ["$status", "waiting"] }, then: 1 },
              { case: { $eq: ["$status", "completed"] }, then: 2 },
              { case: { $eq: ["$status", "cancelled"] }, then: 3 },
            ],
            default: 4,
          },
        },
      },
    });
  }

  pipeline.push(sortStage);

  const results = await Visit.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const result = results[0] || { data: [], count: [] };
  const total = result.count[0]?.total ?? 0;

  await Visit.populate(result.data, [
    { path: "patient", select: "firstName lastName patientCode" },
    { path: "doctor", select: "firstName lastName" },
    { path: "createdBy", select: "firstName lastName" },
  ]);

  return { visits: result.data, total };
};

const findVisitById = async (id) => {
  return await Visit.findById(id)
    .populate("patient", "firstName lastName patientCode phone gender dateOfBirth bloodGroup allergies chronicDiseases")
    .populate("doctor", "firstName lastName")
    .populate("createdBy", "firstName lastName");
};

const findActiveConsultationByDoctor = async (doctorId, excludeVisitId = null) => {
  const query = { doctor: doctorId, status: "in_consultation" };
  if (excludeVisitId) query._id = { $ne: excludeVisitId };
  return await Visit.findOne(query);
};

const findActiveVisitByPatient = async (patientId, hospitalId) => {
  return await Visit.findOne({
    patient: patientId,
    hospital: hospitalId,
    status: { $in: ["waiting", "in_consultation"] },
  });
};

const getNextVisitNumber = async (hospitalId) => {
  const count = await Visit.countDocuments({ hospital: hospitalId });
  return `VIS-${String(count + 1).padStart(6, "0")}`;
};

const getNextTokenNumber = async (hospitalId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await Visit.countDocuments({
    hospital: hospitalId,
    createdAt: { $gte: today, $lt: tomorrow },
  });

  return count + 1;
};

const createVisit = async (data) => {
  const result = await Visit.create([data]);
  return result[0];
};

const updateVisitById = async (id, data) => {
  return await Visit.findByIdAndUpdate(id, { $set: data }, { new: true })
    .populate("patient", "firstName lastName patientCode")
    .populate("doctor", "firstName lastName");
};

module.exports = {
  findVisits,
  findVisitById,
  findActiveConsultationByDoctor,
  findActiveVisitByPatient,
  getNextVisitNumber,
  getNextTokenNumber,
  createVisit,
  updateVisitById,
};
