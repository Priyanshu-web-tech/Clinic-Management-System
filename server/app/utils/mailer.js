const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const emailTypeSubject = {
  FORGET_PASSWORD: "Reset Your DocMate Password",
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
};

const sendEmail = async (to, data, type) => {
  const templatePath = templateMap[type];
  if (!templatePath) throw new Error(`No template for email type: ${type}`);

  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replace(/\{\{otp\}\}/g, data.otp);
  html = html.replace(/\{\{userName\}\}/g, data.userName);

  const mailOptions = {
    from: `"DocMate" <${process.env.EMAIL_USER}>`,
    to,
    subject: type,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, emailTypeSubject };
