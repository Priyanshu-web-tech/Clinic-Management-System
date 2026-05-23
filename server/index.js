require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose  
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.info("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.info(`Server up successfully - port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

process.on("unhandledRejection", (err) =>
  console.error("Unhandled rejection:", err.message)
);

process.on("SIGTERM", () => {
  mongoose.connection.close().then(() => {
    console.log("Closing database connection.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  mongoose.connection.close().then(() => {
    console.log("Closing database connection.");
    process.exit(0);
  });
});
