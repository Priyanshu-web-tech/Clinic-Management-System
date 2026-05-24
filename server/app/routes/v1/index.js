const app = require("express")();

app.use("/auth", require("./auth"));
app.use("/hospital", require("./hospital"));

module.exports = app;
