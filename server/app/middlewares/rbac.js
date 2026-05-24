const httpStatus = require("http-status").status;
const response = require("../response/index");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const { userType } = req.data;

    if (!allowedRoles.includes(userType)) {
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
