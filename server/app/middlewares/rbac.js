const httpStatus = require("http-status").status;
const response = require("../response/index");
const { userType: userTypeConst, designation: designationConst } = require("../constant/constant");

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

const authorizeAccess = (...allowedDesignations) => {
  return (req, res, next) => {
    const { userType, designation } = req.data;

    const allowed =
      userType === userTypeConst.ADMIN ||
      userType === userTypeConst.DOCTOR ||
      (userType === userTypeConst.STAFF && allowedDesignations.includes(designation));

    if (!allowed) {
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
  authorizeAccess,
};
