import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import productsRoute from "./routes/products.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import ordersRoute from "./routes/orders.js";
import noteRoutes from "./routes/noteRoutes.js";
import receptionRoutes from "./routes/receptionRoute.js";
import { verifyToken } from "./utils/verifyUser.js";
dotenv.config();
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

const app = express();

// USING MIDDLEWARES HERE
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRoute);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/notes", noteRoutes);
app.use("/api/reception", receptionRoutes);
app.get("/api/check-token", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid.",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("Server is running and everything is fine!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
