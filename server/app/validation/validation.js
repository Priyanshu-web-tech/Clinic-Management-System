const Joi = require("joi");

const passwordSchema = Joi.string()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
  .min(8)
  .max(30)
  .required()
  .messages({
    "string.pattern.base": "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  });

const login = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
});

const register = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
  password: passwordSchema,
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required.",
  }),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
    }),
  hospitalName: Joi.string().trim().required().messages({
    "any.required": "Hospital name is required.",
  }),
  address: Joi.string().trim().optional().allow(""),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
});

const verifyOtp = Joi.object({
  otp: Joi.string()
    .pattern(/^\d+$/)
    .length(Number(process.env.OTP_DIGIT) || 6)
    .required()
    .messages({
      "string.length": `OTP must be ${Number(process.env.OTP_DIGIT) || 6} digits.`,
      "string.pattern.base": "OTP must contain only digits.",
      "any.required": "OTP is required.",
    }),
});

const resetPassword = Joi.object({
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your password.",
    }),
});

const updateProfile = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required.",
  }),
  phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
    }),
});

const updateHospital = Joi.object({
  name: Joi.string().trim().required().messages({
    "any.required": "Hospital name is required.",
  }),
  address: Joi.string().trim().optional().allow(""),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your new password.",
    }),
});

module.exports = { login, register, forgotPassword, verifyOtp, resetPassword, updateProfile, changePassword, updateHospital };
