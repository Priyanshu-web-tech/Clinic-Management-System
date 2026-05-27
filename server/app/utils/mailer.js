const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const emailTypeSubject = {
  FORGET_PASSWORD: "Reset Your DocMate Password",
  WELCOME_USER: "Welcome to DocMate - Your Account Credentials",
  VISIT_SUMMARY: "Your DocMate Prescription Summary",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const templateMap = {
  [emailTypeSubject.FORGET_PASSWORD]: path.join(
    __dirname,
    "../emails/templates/forgotPassword.html"
  ),
  [emailTypeSubject.WELCOME_USER]: path.join(
    __dirname,
    "../emails/templates/welcomeUser.html"
  ),
  [emailTypeSubject.VISIT_SUMMARY]: path.join(
    __dirname,
    "../emails/templates/prescriptionEmail.html"
  ),
};

const sendEmail = async (to, data, type) => {
  const templatePath = templateMap[type];
  if (!templatePath) throw new Error(`No template for email type: ${type}`);

  let html = fs.readFileSync(templatePath, "utf8");

  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  });

  const mailOptions = {
    from: `"DocMate" <${process.env.EMAIL_USER}>`,
    to,
    subject: type,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, emailTypeSubject };
