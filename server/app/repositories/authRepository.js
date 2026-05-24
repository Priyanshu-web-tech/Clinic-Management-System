const User = require("../models/user");

const findUserByEmail = async (email, select, session) => {
  return await User.findOne({ email }, select, session ? { session } : {});
};

const findUserForSessionData = async (userId) => {
  return await User.findById(userId).select("-password").populate("hospital", "name address");
};

const findUserById = async (userId, select, session) => {
  return await User.findById(userId, select, session ? { session } : {});
};

const updateUser = async (data, condition, session) => {
  return await User.updateOne(condition, { $set: data }, session ? { session } : {});
};

const createUser = async (data, session) => {
  const result = await User.create([data], session ? { session } : {});
  return result[0];
};

module.exports = { findUserByEmail, findUserForSessionData, findUserById, updateUser, createUser };
