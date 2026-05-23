const httpStatus = require("http-status").status;

const { db } = require("../models/index");
const sessionService = require("../services/sessionService");
const authRepository = require("../repositories/authRepository");
const { generateHash, comparePassword } = require("../utils/password");
const { userStatus } = require("../constant/constant");
const { verifyAccessTokenRaw } = require("../middlewares/jwt");

const loginByEmail = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password, deviceId } = body;

    const checkUser = await authRepository.findUserByEmail(email, null, transaction);
    if (!checkUser) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    if (checkUser.status === userStatus.DEACTIVATED) {
      return {
        error: true,
        data: {},
        msgCode: "YOU_ACCOUNT_HAS_BEEN_SUSPENDED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    if (checkUser.status === userStatus.DELETED) {
      return {
        error: true,
        data: {},
        msgCode: "YOU_ACCOUNT_HAS_BEEN_DELETED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const isPasswordValid = await comparePassword(password, checkUser.password);
    if (!isPasswordValid) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_PASSWORD",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const sessionTokens = sessionService.generateSessionTokens({ user: checkUser, deviceId }, res);

    const existingSession = await sessionService.checkIfSessionExist(checkUser._id, deviceId, transaction);
    if (!existingSession) {
      await sessionService.createSession(
        {
          userId: checkUser._id,
          deviceId,
          accessToken: sessionTokens.accessToken,
          refreshToken: sessionTokens.refreshToken,
        },
        transaction
      );
    } else {
      await sessionService.updateSession(
        { user_id: checkUser._id, device_id: deviceId },
        { access_token: sessionTokens.accessToken, refresh_token: sessionTokens.refreshToken, last_login: new Date() },
        transaction
      );
    }

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        user: {
          id: checkUser._id,
          email: checkUser.email,
          first_name: checkUser.first_name,
          last_name: checkUser.last_name,
          user_type: checkUser.user_type,
        },
      },
      msgCode: "LOGIN_SUCCESSFUL",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

const registerUser = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email, password, firstName, lastName, userType, deviceId } = body;

    const existingUser = await authRepository.findUserByEmail(email, null, transaction);
    if (existingUser) {
      return {
        error: true,
        data: {},
        msgCode: "ALREADY_EXIST",
        status: httpStatus.CONFLICT,
        transaction,
      };
    }

    const hash = await generateHash(password);
    const user = await authRepository.createUser(
      {
        email,
        password: hash,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      },
      transaction
    );

    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "UNABLE_TO_CREATE",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        transaction,
      };
    }

    const sessionTokens = sessionService.generateSessionTokens({ user, deviceId }, res);

    await sessionService.createSession(
      {
        userId: user._id,
        deviceId,
        accessToken: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
      },
      transaction
    );

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
        },
      },
      msgCode: "REGISTERED_SUCCESSFULLY",
      status: httpStatus.CREATED,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

const refreshTokens = async (refreshToken, res) => {
  const transaction = await db.transaction();
  try {
    let decoded;
    try {
      decoded = verifyAccessTokenRaw(refreshToken);
    } catch (err) {
      return {
        error: true,
        data: {},
        msgCode: err.message === "jwt expired" ? "REFRESH_TOKEN_EXPIRED" : "INVALID_REFRESH_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const existingSession = await sessionService.findSessionByCondition(
      { user_id: decoded.id, refresh_token: refreshToken },
      transaction
    );
    if (!existingSession) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_REFRESH_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const user = await authRepository.findUserById(decoded.id, null, transaction);
    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    if (user.status === userStatus.DEACTIVATED) {
      return {
        error: true,
        data: {},
        msgCode: "YOU_ACCOUNT_HAS_BEEN_SUSPENDED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    if (user.status === userStatus.DELETED) {
      return {
        error: true,
        data: {},
        msgCode: "YOU_ACCOUNT_HAS_BEEN_DELETED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const deviceId = existingSession.device_id;
    const sessionTokens = sessionService.generateSessionTokens({ user, deviceId }, res);

    await sessionService.updateSession(
      { user_id: user._id, device_id: deviceId },
      {
        access_token: sessionTokens.accessToken,
        refresh_token: sessionTokens.refreshToken,
        last_login: new Date(),
      },
      transaction
    );

    return {
      error: false,
      data: {
        token: sessionTokens.accessToken,
        refreshToken: sessionTokens.refreshToken,
      },
      msgCode: "TOKEN_REFRESHED",
      status: httpStatus.OK,
      transaction,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: err,
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
      transaction,
    };
  }
};

module.exports = { loginByEmail, registerUser, refreshTokens };
