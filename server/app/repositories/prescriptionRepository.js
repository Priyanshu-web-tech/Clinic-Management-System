const Prescription = require("../models/prescription");
const PrescriptionMedicine = require("../models/prescriptionmedicine");

const findPrescriptionByVisit = async (visitId) => {
  const prescription = await Prescription.findOne({ visit: visitId }).lean();
  if (!prescription) return null;
  const medicines = await PrescriptionMedicine.find({ prescription: prescription._id }).lean();
  return { ...prescription, medicines };
};

const findPrescriptions = async ({ filter, page, pageSize }) => {
  const limit = pageSize || 20;
  const skip = ((page || 1) - 1) * limit;

  const results = await Prescription.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        pipeline: [{ $match: { isActive: true } }],
        as: "_activePatient",
      },
    },
    { $match: { "_activePatient.0": { $exists: true } } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const result = results[0] || { data: [], count: [] };
  const total = result.count[0]?.total ?? 0;
  const prescriptions = result.data;

  await Prescription.populate(prescriptions, [
    { path: "patient", select: "firstName lastName patientCode" },
    { path: "doctor", select: "firstName lastName" },
    { path: "visit", select: "visitNumber tokenNumber status createdAt" },
  ]);

  const prescriptionIds = prescriptions.map((p) => p._id);
  const medicines = await PrescriptionMedicine.find({
    prescription: { $in: prescriptionIds },
  }).lean();

  const medicinesMap = medicines.reduce((acc, m) => {
    const key = String(m.prescription);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const withMedicines = prescriptions.map((p) => ({
    ...p,
    medicines: medicinesMap[String(p._id)] || [],
  }));

  return { prescriptions: withMedicines, total };
};

const upsertPrescription = async ({ hospital, visit, patient, doctor }, session = null) => {
  const opts = { upsert: true, returnDocument: "after", ...(session ? { session } : {}) };
  return await Prescription.findOneAndUpdate(
    { visit },
    { hospital, visit, patient, doctor },
    opts,
  );
};

const replaceMedicines = async (prescriptionId, medicines, session = null) => {
  const opts = session ? { session } : {};
  await PrescriptionMedicine.deleteMany({ prescription: prescriptionId }, opts);
  if (!medicines || medicines.length === 0) return [];
  const docs = medicines.map((m) => ({ ...m, prescription: prescriptionId }));
  return await PrescriptionMedicine.insertMany(docs, opts);
};

module.exports = {
  findPrescriptionByVisit,
  findPrescriptions,
  upsertPrescription,
  replaceMedicines,
};
