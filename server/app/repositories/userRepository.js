const User = require("../models/user");

const findUsers = async ({ filter, search, page, pageSize }) => {
  const limit = pageSize || 10;
  const skip = ((page || 1) - 1) * limit;

  const query = { ...filter };

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -loginAttempts -lockUntil")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  console.log(
    "User query:",
    JSON.stringify(query),
    "Page:",
    page,
    "PageSize:",
    pageSize,
  );

  return { users, total };
};

const findUserById = async (id) => {
  return await User.findById(id).select("-password -loginAttempts -lockUntil");
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (data) => {
  const result = await User.create([data]);
  return result[0];
};

const updateUserById = async (id, data) => {
  return await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select(
    "-password -loginAttempts -lockUntil",
  );
};

module.exports = {
  findUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
};
