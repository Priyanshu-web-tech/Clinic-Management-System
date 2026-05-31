const { success, error } = require("../response/index");
const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const result = await authService.loginByEmail(
      req.body,
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
    const result = await authService.registerUser(
      req.body,
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
    const result = await authService.refreshTokens(req, res);

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

const getProfile = async (req, res) => {
  try {
    return success(req, res, { msgCode: "SUCCESS", data: req.data }, 200);
  } catch (err) {
    return error(req, res, { msgCode: "INTERNAL_SERVER_ERROR", data: {} }, 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body, res);

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

const verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(req, res);

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

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req, res);

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

const updateProfile = async (req, res) => {
  try {
    const result = await authService.updateProfile(req);

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

const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(req);

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

const logout = async (req, res) => {
  try {
    const result = await authService.logout(req, res);

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

module.exports = { login, register, refreshToken, getProfile, forgotPassword, verifyOtp, resetPassword, updateProfile, changePassword, logout };
