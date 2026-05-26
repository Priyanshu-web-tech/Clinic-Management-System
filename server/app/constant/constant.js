const userType = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  STAFF: "staff",
};

const designation = {
  RECEPTIONIST: "receptionist",
  CHEMIST: "chemist",
};

const otpType = {
  RESET_PASSWORD: "reset_password",
};

const gender = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

const bloodGroup = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

module.exports = { userType, otpType, designation, gender, bloodGroup };
