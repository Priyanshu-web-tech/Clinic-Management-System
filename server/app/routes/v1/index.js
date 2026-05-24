const app = require("express")();

app.use("/auth", require("./auth"));
app.use("/hospital", require("./hospital"));
app.use("/users", require("./users"));

module.exports = app;
