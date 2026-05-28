const fs = require("fs");
const path = require("path");

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

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "DocMate", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject: type,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo error: ${JSON.stringify(error)}`);
  }

  return response.json();
};

module.exports = { sendEmail, emailTypeSubject };
