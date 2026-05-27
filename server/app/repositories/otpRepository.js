const Otp = require("../models/otp");

const findByCondition = async (condition, session) => {
  return await Otp.findOne(condition, null, session ? { session } : {});
};

const create = async (data, session) => {
  const result = await Otp.create([data], session ? { session } : {});
  return result[0];
};

const updateOtp = async (data, condition, session) => {
  return await Otp.updateOne(condition, { $set: data }, session ? { session } : {});
};

const deleteByCondition = async (condition, session) => {
  return await Otp.deleteOne(condition, session ? { session } : {});
};

module.exports = { findByCondition, create, updateOtp, deleteByCondition };
