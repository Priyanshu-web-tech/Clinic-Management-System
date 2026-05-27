require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

// Cache the connection promise so warm serverless invocations reuse the connection
const dbPromise = mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.info("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  });

// Serverless handler — waits for DB then delegates to Express
const handler = async (req, res) => {
  await dbPromise;
  return app(req, res);
};

// Local dev: only call app.listen() when run directly (not imported by Vercel)
if (require.main === module) {
  dbPromise
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.info(`Server up successfully - port: ${process.env.PORT}`);
      });
    })
    .catch(() => process.exit(1));
}

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

module.exports = handler;
