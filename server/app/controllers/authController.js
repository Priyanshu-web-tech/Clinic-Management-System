const { success, error } = require("../response/index");
const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const deviceId = req.ip || "web";
    const result = await authService.loginByEmail(
      { ...req.body, deviceId },
      res,
    );

    if (result.error) {
      throw result;
    }

    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
      err.transaction,
    );
  }
};

const register = async (req, res) => {
  try {
    const deviceId = req.ip || "web";
    const result = await authService.registerUser(
      { ...req.body, deviceId },
      res,
    );

    if (result.error) {
      throw result;
    }

    return success(
      req,
      res,
      { msgCode: result.msgCode, data: result.data },
      result.status,
      result.transaction,
    );
  } catch (err) {
    return error(
      req,
      res,
      { msgCode: err.msgCode, data: err.data || {} },
      err.status,
      err.transaction,
    );
  }
};

const refreshToken = async (req, res) => {
  try {
    const token =
      req.cookies["REFRESH-TOKEN"] ||
      (req?.headers?.authorization?.startsWith("Bearer ")
        ? req?.headers?.authorization?.split(" ")[1]
        : null);

    if (!token) {
      return error(req, res, { msgCode: "MISSING_TOKEN", data: {} }, 401);
    }

    const result = await authService.refreshTokens(token, res);

    if (result.error) {
      throw result;
    }

    return success(req, res, { msgCode: result.msgCode, data: result.data }, result.status, result.transaction);
  } catch (err) {
    return error(req, res, { msgCode: err.msgCode, data: err.data || {} }, err.status, err.transaction);
  }
};

const getProfile = async (req, res) => {
  try {
    return success(req, res, { msgCode: "SUCCESS", data: req.data }, 200);
  } catch (err) {
    return error(req, res, { msgCode: "INTERNAL_SERVER_ERROR", data: {} }, 500);
  }
};

module.exports = { login, register, refreshToken, getProfile };
