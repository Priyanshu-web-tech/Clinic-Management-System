const httpStatus = require("http-status").status;
const response = require("../response/index");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const { user_type } = req.data;

    if (!allowedRoles.includes(user_type)) {
      return response.error(
        req,
        res,
        { msgCode: "ACCESS_DENIED" },
        httpStatus.FORBIDDEN
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
