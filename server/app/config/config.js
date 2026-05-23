const { env } = require("process");
module.exports = {
  development: {
    allowedOrigins: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://clinic-management-system-api.vercel.app",
    ],
    serverRedirectURI: "https://clinic-management-system-api.vercel.app",
  },
};
