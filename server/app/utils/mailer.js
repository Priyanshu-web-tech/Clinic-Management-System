const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

const resend = new Resend(process.env.RESEND_API_KEY);

const emailTypeSubject = {
  FORGET_PASSWORD: "Reset Your DocMate Password",
  WELCOME_USER: "Welcome to DocMate - Your Account Credentials",
  VISIT_SUMMARY: "Your DocMate Prescription Summary",
};

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

  const { data, error } = await resend.emails.send({
    from: "DocMate <onboarding@resend.dev>",
    to,
    subject: type,
    html,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
};

module.exports = { sendEmail, emailTypeSubject };
