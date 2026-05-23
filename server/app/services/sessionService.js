const sessionRepository = require("../repositories/sessionRepository");
const { generateUserToken, generateUserRefreshToken } = require("../middlewares/jwt");

const generateSessionTokens = (data, res) => {
  const { user, deviceId } = data;

  const accessToken = generateUserToken(
    {
      id: user._id,
      user_type: user.user_type,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      device_id: deviceId,
    },
    res
  );

  const refreshToken = generateUserRefreshToken(
    {
      id: user._id,
      device_id: deviceId,
    },
    res
  );

  return { accessToken, refreshToken };
};

const checkIfSessionExist = async (userId, deviceId, session) => {
  return await sessionRepository.findByCondition({ user_id: userId, device_id: deviceId }, session);
};

const createSession = async (data, session) => {
  const { userId, deviceId, accessToken, refreshToken } = data;
  return await sessionRepository.create(
    { user_id: userId, device_id: deviceId, access_token: accessToken, refresh_token: refreshToken },
    session
  );
};

const updateSession = async (condition, data, session) => {
  return await sessionRepository.updateSession(condition, data, session);
};

const findSessionByCondition = async (condition, session) => {
  return await sessionRepository.findByCondition(condition, session);
};

module.exports = { generateSessionTokens, checkIfSessionExist, createSession, updateSession, findSessionByCondition };
