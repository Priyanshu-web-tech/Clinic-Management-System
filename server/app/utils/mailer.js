const Brevo = require("@getbrevo/brevo");
const fs = require("fs");
const path = require("path");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

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

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "DocMate", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = type;
  sendSmtpEmail.htmlContent = html;

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendEmail, emailTypeSubject };
