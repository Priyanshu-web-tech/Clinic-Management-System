const Joi = require("joi");
const { userType } = require("../constant/constant");

const passwordSchema = Joi.string()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
  .message(
    "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
  )
  .min(8)
  .max(30)
  .required();

const login = Joi.object({
  email: Joi.string().email().message("Please enter a valid email").required(),
  password: Joi.string().required(),
});

const register = Joi.object({
  email: Joi.string().email().message("Please enter a valid email").required(),
  password: passwordSchema,
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required.",
  }),
  userType: Joi.string()
    .valid(...Object.values(userType))
    .required()
    .messages({
      "any.only": `User type must be one of [${Object.values(userType).join(", ")}]`,
      "any.required": "User type is required.",
    }),
});

module.exports = { login, register };
