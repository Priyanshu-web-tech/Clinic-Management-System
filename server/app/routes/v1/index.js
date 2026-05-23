const app = require("express")();

app.use("/auth", require("./auth"));

module.exports = app;
