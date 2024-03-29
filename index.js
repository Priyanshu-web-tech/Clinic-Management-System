import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import productsRoute from "./routes/products.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import ordersRoute from "./routes/orders.js";
import noteRoutes from './routes/noteRoutes.js';


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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRoute);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/notes", noteRoutes);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
