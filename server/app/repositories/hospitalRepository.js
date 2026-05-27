const Hospital = require("../models/hospital");

const findById = async (hospitalId, select, session) => {
  return await Hospital.findById(hospitalId, select, session ? { session } : {});
};

const updateHospital = async (data, condition, session) => {
  return await Hospital.updateOne(condition, { $set: data }, session ? { session } : {});
};

module.exports = { findById, updateHospital };
