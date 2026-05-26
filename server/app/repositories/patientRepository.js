const Patient = require("../models/patient");

const findPatients = async ({ filter, search, page, pageSize }) => {
  const limit = pageSize || 10;
  const skip = ((page || 1) - 1) * limit;

  const query = { ...filter };

  if (search) {
    const regex = new RegExp(search, "i");
    const orConditions = [
      { firstName: regex },
      { lastName: regex },
      { phone: regex },
      { patientCode: regex },
    ];

    const parts = search.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstRegex = new RegExp(parts[0], "i");
      const lastRegex = new RegExp(parts.slice(1).join(" "), "i");
      orConditions.push(
        { firstName: firstRegex, lastName: lastRegex },
        { firstName: lastRegex, lastName: firstRegex },
      );
    }

    query.$or = orConditions;
  }

  const [patients, total] = await Promise.all([
    Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Patient.countDocuments(query),
  ]);

  return { patients, total };
};

const findPatientById = async (id) => {
  return await Patient.findById(id);
};

const findPatientByPhone = async (phone, hospitalId, excludeId = null) => {
  const query = { phone, hospital: hospitalId };
  if (excludeId) query._id = { $ne: excludeId };
  return await Patient.findOne(query);
};

const getNextPatientCode = async (hospitalId) => {
  const count = await Patient.countDocuments({ hospital: hospitalId });
  return `P${String(count + 1).padStart(5, "0")}`;
};

const createPatient = async (data) => {
  const result = await Patient.create([data]);
  return result[0];
};

const updatePatientById = async (id, data) => {
  return await Patient.findByIdAndUpdate(id, { $set: data }, { new: true });
};

module.exports = {
  findPatients,
  findPatientById,
  findPatientByPhone,
  getNextPatientCode,
  createPatient,
  updatePatientById,
};
