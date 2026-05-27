const { env } = require("process");

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ];

module.exports = {
  development: {
    allowedOrigins,
    serverRedirectURI: env.SERVER_REDIRECT_URI || "http://localhost:3000",
  },
  production: {
    allowedOrigins,
    serverRedirectURI: env.SERVER_REDIRECT_URI || "http://localhost:3000",
  },
};
