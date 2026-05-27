const app = require("express")();

app.use("/auth", require("./auth"));
app.use("/hospital", require("./hospital"));
app.use("/users", require("./users"));
app.use("/patients", require("./patients"));
app.use("/visits", require("./visits"));
app.use("/prescriptions", require("./prescriptions"));

module.exports = app;
