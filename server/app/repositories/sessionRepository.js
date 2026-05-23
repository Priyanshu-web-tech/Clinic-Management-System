const Session = require("../models/session");

const create = async (data, session) => {
  const result = await Session.create([data], session ? { session } : {});
  return result[0];
};

const findByCondition = async (condition, session) => {
  return await Session.findOne(condition, null, session ? { session } : {});
};

const updateSession = async (condition, data, session) => {
  return await Session.updateOne(condition, { $set: data }, session ? { session } : {});
};

const deleteSession = async (condition, session = undefined, force = false) => {
  const data = await Session.deleteOne(condition, session ? { session } : {});
  return data.deletedCount > 0 ? data : false;
};

const getAuthDetails = async (condition) => {
  try {
    const result = await Session.findOne(condition)
      .select("-createdAt -updatedAt")
      .populate({ path: "user_id", select: "-createdAt -updatedAt" });
    return result ? JSON.parse(JSON.stringify(result)) : false;
  } catch (error) {
    console.log("error>>", error);
    return false;
  }
};

module.exports = { create, findByCondition, updateSession, deleteSession, getAuthDetails };
