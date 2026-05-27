const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swaggerconfig");
const {
  methodNotAllowed,
  genericErrorHandler,
} = require("./app/error-handler/error");

const app = express();
const env = process.env.NODE_ENV || "development";
const configs = require("./app/config/config")[env];
const morganFormat =
  ":method :url :status :response-time ms | " +
  ':date[iso] | IP=:remote-addr | UA=":user-agent"\n';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
  }),
);
app.disable("x-powered-by");
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || configs.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/plain" }));

app.use(morgan(morganFormat));

// Health check route
app.get("/health", (req, res) => res.send("Health check OK"));

// Swagger documentation — strip CSP so swagger-ui inline scripts/styles work
app.use("/api-docs", (req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js",
    ],
    swaggerOptions: {
      withCredentials: true,
      requestInterceptor: (req) => {
        // eslint-disable-next-line no-undef
        const authToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth-token="))
          ?.split("=")[1];

        if (authToken) {
          req.headers["Authorization"] = `Bearer ${authToken}`;
        }

        return req;
      },
    },
  }),
);

app.use("/api", require("./app/routes/index"));

// Error handling
app.use(methodNotAllowed);
app.use(genericErrorHandler);

module.exports = app;
