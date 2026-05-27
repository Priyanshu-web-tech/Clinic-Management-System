require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.info("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });

app.listen(process.env.PORT, () => {
  console.info(`Server up successfully - port: ${process.env.PORT}`);
});
