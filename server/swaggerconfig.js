const swaggerJsDoc = require("swagger-jsdoc");
const config = require("./app/config/config")[process.env.NODE_ENV];

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Docmate API",
      version: "1.0.0",
      description: "APIs",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local Server",
      },
      {
        url: `${config.serverRedirectURI}/api`,
        description: `Swagger Documentation for ${process.env.NODE_ENV} server`,
      },
    ],
  },
  apis: ["./app/routes/**/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
