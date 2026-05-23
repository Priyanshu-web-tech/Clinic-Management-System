const userType = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  STAFF: "staff",
  PHARMACIST: "pharmacist",
};

const userStatus = {
  ACTIVE: "active",
  DELETED: "deleted",
  DEACTIVATED: "deactivated",
};

const otpType = {
  RESET_PASSWORD: "reset_password",
};

module.exports = { userType, userStatus, otpType };
