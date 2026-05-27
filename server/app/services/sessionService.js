const sessionRepository = require("../repositories/sessionRepository");
const { generateUserToken, generateUserRefreshToken } = require("../middlewares/jwt");

const generateSessionTokens = (data, res) => {
  const { user, deviceId } = data;

  const accessToken = generateUserToken(
    {
      id: user._id,
      userType: user.userType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      deviceId,
    },
    res
  );

  const refreshToken = generateUserRefreshToken(
    {
      id: user._id,
      deviceId,
    },
    res
  );

  return { accessToken, refreshToken };
};

const checkIfSessionExist = async (userId, deviceId, session) => {
  return await sessionRepository.findByCondition({ userId, deviceId }, session);
};

const createSession = async (data, session) => {
  const { userId, deviceId, accessToken, refreshToken } = data;
  return await sessionRepository.create(
    { userId, deviceId, accessToken, refreshToken },
    session
  );
};

const updateSession = async (condition, data, session) => {
  return await sessionRepository.updateSession(condition, data, session);
};

const findSessionByCondition = async (condition, session) => {
  return await sessionRepository.findByCondition(condition, session);
};

const deleteSession = async (condition, session) => {
  return await sessionRepository.deleteSession(condition, session);
};

module.exports = { generateSessionTokens, checkIfSessionExist, createSession, updateSession, findSessionByCondition, deleteSession };
