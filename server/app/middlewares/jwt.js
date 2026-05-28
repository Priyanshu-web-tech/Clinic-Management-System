const fs = require("fs");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status").status;

const response = require("../response/index");
const authRepository = require("../repositories/authRepository");
const sessionRepository = require("../repositories/sessionRepository");

const generateUserToken = (data, res) => {
  const privateToken = fs.readFileSync("private.key", "utf8");
  const options = {
    issuer: process.env.JWT_ISSUER,
    algorithm: process.env.JWT_ALGO,
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  };
  const token = jwt.sign(data, privateToken, options);

  // Set the token in a cookie
  res.cookie("SESSION-TOKEN", token, {
    httpOnly: true,
    secure: true, // HTTPS only in production
    sameSite: "none",
    maxAge: 86400000, // 24 hour
  });

  return token;
};

const generateUserRefreshToken = (data, res) => {
  const privateToken = fs.readFileSync("private.key", "utf8");
  const options = {
    issuer: process.env.JWT_ISSUER,
    algorithm: process.env.JWT_ALGO,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  };
  const refreshToken = jwt.sign(data, privateToken, options);

  // Set the refresh token in a cookie
  res.cookie("REFRESH-TOKEN", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 604800000, // 7 days
  });

  return refreshToken;
};

const generateOtpToken = (data, res) => {
  const options = { expiresIn: process.env.OTP_EXPIRES_IN };
  const otpToken = jwt.sign(data, process.env.SECRET_KEY, options);

  // Set the OTP token in a secure cookie
  res.cookie("OTP-TOKEN", otpToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // Convert to milliseconds
  });

  return otpToken;
};

const generateVerifyToken = (data, res) => {
  const options = { expiresIn: process.env.OTP_EXPIRES_IN };
  const verifyToken = jwt.sign(data, process.env.SECRET_KEY, options);

  // Set the VERIFY token in a secure cookie
  res.cookie("VERIFY-TOKEN", verifyToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // Convert to milliseconds
  });

  return verifyToken;
};

const verifyAuthToken = (req, res, next) => {
  try {
    const publicToken = fs.readFileSync("public.key");
    let token =
      req.cookies["SESSION-TOKEN"] ||
      (req?.headers?.authorization?.startsWith("Bearer ")
        ? req?.headers?.authorization?.split(" ")[1]
        : null);
    if (!token) {
      return response.error(
        req,
        res,
        { msgCode: "MISSING_TOKEN" },
        httpStatus.UNAUTHORIZED
      );
    }

    const verifyOptions = {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGO,
    };

    jwt.verify(token, publicToken, verifyOptions, async (error, decoded) => {
      if (error) {
        let msgCode = "INVALID_TOKEN";
        if (error.message === "jwt expired") {
          msgCode = "TOKEN_EXPIRED";
        }
        return response.error(req, res, { msgCode }, httpStatus.UNAUTHORIZED);
      }

      const condition = { accessToken: token };
      const checkJwt = await sessionRepository.getAuthDetails(condition);
      if (!checkJwt) {
        return response.error(
          req,
          res,
          { msgCode: "INVALID_TOKEN" },
          httpStatus.UNAUTHORIZED
        );
      } else {
        const userDetails = await authRepository.findUserForSessionData(decoded?.id);
        if(userDetails?.deleted_at) {
          await sessionRepository.deleteSession(
            { userId: userDetails?.id },
            undefined,
            true
          );
          return response.error(
            req,
            res,
            { msgCode: "YOU_ACCOUNT_HAS_BEEN_DELETED" },
            httpStatus.FORBIDDEN
          );
        }
        req.data = userDetails;
        return next();
      }
    });
  } catch (err) {
    return response.error(
      req,
      res,
      { msgCode: "INTERNAL_SERVER_ERROR", data: err },
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const verifyOtpToken = (req, res, next) => {
  try {
    let token;
    if (req.url === "/verify-otp") {
      token =
        req.cookies["OTP-TOKEN"] ||
        (req?.headers?.authorization?.startsWith("Bearer ")
          ? req?.headers?.authorization?.split(" ")[1]
          : null);
    } else {
      token =
        req.cookies["VERIFY-TOKEN"] ||
        (req?.headers?.authorization?.startsWith("Bearer ")
          ? req?.headers?.authorization?.split(" ")[1]
          : null);
    }

    if (!token) {
      return response.error(
        req,
        res,
        { msgCode: "INVALID_OTP_TOKEN" },
        httpStatus.UNAUTHORIZED
      );
    }
    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      if (error) {
        let msgCode = "INVALID_OTP_TOKEN";
        if (error.message === "jwt expired") {
          msgCode = "OTP_TOKEN_EXPIRED";
        }
        return response.error(req, res, { msgCode }, httpStatus.UNAUTHORIZED);
      }
      req.token = decoded;
      return next();
    });
  } catch (err) {
    return response.error(
      req,
      res,
      { msgCode: "INTERNAL_SERVER_ERROR", data: err },
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const verifyAccessTokenRaw = (token) => {
  const publicToken = fs.readFileSync("public.key");
  const verifyOptions = {
    issuer: process.env.JWT_ISSUER,
    algorithm: process.env.JWT_ALGO,
  };
  return jwt.verify(token, publicToken, verifyOptions);
};

module.exports = {
  generateUserToken,
  verifyAuthToken,
  generateUserRefreshToken,
  generateOtpToken,
  verifyOtpToken,
  generateVerifyToken,
  verifyAccessTokenRaw
};
