const httpStatus = require("http-status").status;
const otpGenerator = require("otp-generator");

const { db } = require("../models/index");
const sessionService = require("../services/sessionService");
const authRepository = require("../repositories/authRepository");
const otpRepository = require("../repositories/otpRepository");
const { generateHash, comparePassword } = require("../utils/password");
const { otpType } = require("../constant/constant");
const { verifyAccessTokenRaw, generateOtpToken, generateVerifyToken } = require("../middlewares/jwt");
const { sendEmail, emailTypeSubject } = require("../utils/mailer");
const { getTimeDiffInMin } = require("../utils/helper");
const sessionRepository = require("../repositories/sessionRepository");

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

    if (checkUser.lock_until && Date.now() < checkUser.lock_until) {
      const remainingMs = checkUser.lock_until - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      const minutesText = `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
      return {
        error: true,
        data: {},
        msgCode: `Your account has been temporarily locked due to multiple failed login attempts. Please try again in ${minutesText} or reset your password.`,
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const isPasswordValid = await comparePassword(password, checkUser.password);
    if (!isPasswordValid) {
      const newAttempts = (checkUser.login_attempts || 0) + 1;
      const updateData = { login_attempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lock_until = Date.now() + 10 * 60 * 1000;
        updateData.login_attempts = 0;
      }
      await authRepository.updateUser(updateData, { _id: checkUser._id });
      if (newAttempts >= 5) {
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed login attempts. Please try again in 10 minutes or reset your password.`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }
      return {
        error: true,
        data: {},
        msgCode: "INVALID_PASSWORD",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    await authRepository.updateUser({ login_attempts: 0, lock_until: null }, { _id: checkUser._id });

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

const refreshTokens = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const refreshToken =
      req.cookies?.["REFRESH-TOKEN"] ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!refreshToken) {
      return {
        error: true,
        data: {},
        msgCode: "MISSING_TOKEN",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

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

const forgotPassword = async (body, res) => {
  const transaction = await db.transaction();
  try {
    const { email } = body;

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

    let otp;
    if (process.env.OTP_BYPASS === "true") {
      otp = process.env.OTP;
    } else {
      otp = otpGenerator.generate(Number(process.env.OTP_DIGIT) || 6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
    }

    const hashOtp = await generateHash(otp.toString());
    const otpCond = { user_id: checkUser._id, otp_type: otpType.RESET_PASSWORD };
    const checkOtp = await otpRepository.findByCondition(otpCond, transaction);

    if (checkOtp) {
      const timeDiffInMin = getTimeDiffInMin(checkOtp.otp_sent_at);
      const retryTimeDiffInMin = getTimeDiffInMin(checkOtp.last_attempt);
      let updateData = { otp: hashOtp, otp_sent_at: Date.now() };

      if (checkOtp.otp_retries >= 2 && retryTimeDiffInMin < 10) {
        const remaining = Math.ceil(10 - retryTimeDiffInMin);
        const minutesText = remaining > 0 ? `${remaining} minute${remaining !== 1 ? "s" : ""}` : null;
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }

      if (checkOtp.otp_sent >= 6 && timeDiffInMin < 10) {
        const remaining = Math.ceil(10 - timeDiffInMin);
        const minutesText = remaining > 0 ? `${remaining} minute${remaining !== 1 ? "s" : ""}` : null;
        return {
          error: true,
          data: { time_in_minutes: 10 - timeDiffInMin },
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }

      if (timeDiffInMin <= 5) {
        updateData.otp_sent = checkOtp.otp_sent + 1;
      } else if (timeDiffInMin >= 10) {
        updateData.otp_sent = 1;
        updateData.otp_retries = 0;
      } else {
        updateData.otp_sent = checkOtp.otp_sent + 1;
      }

      const updateOtpDetails = await otpRepository.updateOtp(updateData, otpCond, transaction);
      if (!updateOtpDetails) {
        return {
          error: true,
          data: {},
          msgCode: "UNABLE_TO_UPDATE",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          transaction,
        };
      }
    } else {
      const otpData = {
        user_id: checkUser._id,
        otp: hashOtp,
        otp_type: otpType.RESET_PASSWORD,
        otp_sent_at: Date.now(),
        otp_sent: 1,
        otp_retries: 0,
        last_attempt: null,
      };

      const createOtpDetails = await otpRepository.create(otpData, transaction);
      if (!createOtpDetails) {
        return {
          error: true,
          data: {},
          msgCode: "OTP_NOT_SEND",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          transaction,
        };
      }
    }

    generateOtpToken({ id: checkUser._id, email: checkUser.email }, res);

    if (process.env.OTP_BYPASS !== "true") {
      await sendEmail(
        email,
        { otp, userName: `${checkUser.first_name} ${checkUser.last_name}` },
        emailTypeSubject.FORGET_PASSWORD
      );
    }

    return {
      error: false,
      data: {},
      msgCode: "OTP_SENT",
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

const verifyOtp = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { otp } = req.body;
    const { id: userId, email } = req.token;

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

    const otpCond = { user_id: checkUser._id, otp_type: otpType.RESET_PASSWORD };
    const checkOtp = await otpRepository.findByCondition(otpCond, transaction);

    if (!checkOtp) {
      return {
        error: true,
        data: {},
        msgCode: "OTP_EXPIRED",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    if (checkOtp.otp_retries >= 3) {
      const retryDiff = getTimeDiffInMin(checkOtp.last_attempt);
      if (retryDiff < 10) {
        const remaining = Math.ceil(10 - retryDiff);
        const minutesText = remaining > 0 ? `${remaining} minute${remaining !== 1 ? "s" : ""}` : null;
        return {
          error: true,
          data: {},
          msgCode: `Your account has been temporarily locked due to multiple failed attempts.${minutesText ? ` Please try again in ${minutesText}.` : ` Please try again later.`}`,
          status: httpStatus.UNAUTHORIZED,
          transaction,
        };
      }
      await otpRepository.updateOtp({ otp_retries: 0 }, otpCond);
    }

    const isOtpValid = await comparePassword(otp.toString(), checkOtp.otp);

    if (!isOtpValid) {
      await otpRepository.updateOtp(
        { otp_retries: checkOtp.otp_retries + 1, last_attempt: Date.now() },
        otpCond
      );
      return {
        error: true,
        data: {},
        msgCode: "INVALID_OTP",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    res.clearCookie("OTP-TOKEN", { httpOnly: true, secure: true, sameSite: "None" });
    generateVerifyToken({ id: checkUser._id, email: checkUser.email }, res);

    return {
      error: false,
      data: {},
      msgCode: "OTP_VERIFIED",
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

const resetPassword = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { password } = req.body;
    const { email } = req.token;

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

    const hash = await generateHash(password);
    await authRepository.updateUser({ password: hash, login_attempts: 0, lock_until: null }, { _id: checkUser._id }, transaction);

    await otpRepository.deleteByCondition(
      { user_id: checkUser._id, otp_type: otpType.RESET_PASSWORD },
      transaction
    );

    res.clearCookie("VERIFY-TOKEN", { httpOnly: true, secure: true, sameSite: "None" });
    res.clearCookie("OTP-TOKEN", { httpOnly: true, secure: true, sameSite: "None" });

    return {
      error: false,
      data: {},
      msgCode: "PASSWORD_RESET_SUCCESSFUL",
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

const updateProfile = async (req) => {
  const transaction = await db.transaction();
  try {
    const { firstName, lastName } = req.body;
    const userId = req.data._id;

    await authRepository.updateUser(
      { first_name: firstName, last_name: lastName },
      { _id: userId },
      transaction
    );

    const updatedUser = await authRepository.findUserById(userId, "-password", transaction);

    return {
      error: false,
      data: {
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          user_type: updatedUser.user_type,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      msgCode: "PROFILE_UPDATED",
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

const changePassword = async (req) => {
  const transaction = await db.transaction();
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.data._id;

    const user = await authRepository.findUserById(userId, null, transaction);
    if (!user) {
      return {
        error: true,
        data: {},
        msgCode: "USER_NOT_REGISTERED",
        status: httpStatus.NOT_FOUND,
        transaction,
      };
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return {
        error: true,
        data: {},
        msgCode: "INVALID_CURRENT_PASSWORD",
        status: httpStatus.UNAUTHORIZED,
        transaction,
      };
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return {
        error: true,
        data: {},
        msgCode: "SAME_PASSWORD",
        status: httpStatus.BAD_REQUEST,
        transaction,
      };
    }

    const hash = await generateHash(newPassword);
    await authRepository.updateUser({ password: hash }, { _id: userId }, transaction);

    return {
      error: false,
      data: {},
      msgCode: "PASSWORD_CHANGED",
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

const logout = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const userId = req.data._id;
    const token =
      req.cookies?.["SESSION-TOKEN"] ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    await sessionRepository.deleteSession({ user_id: userId, access_token: token });

    res.clearCookie("SESSION-TOKEN", { httpOnly: true, secure: true, sameSite: "None" });
    res.clearCookie("REFRESH-TOKEN", { httpOnly: true, secure: true, sameSite: "None" });

    return {
      error: false,
      data: {},
      msgCode: "LOGOUT_SUCCESSFUL",
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

module.exports = { loginByEmail, registerUser, refreshTokens, forgotPassword, verifyOtp, resetPassword, updateProfile, changePassword, logout };
