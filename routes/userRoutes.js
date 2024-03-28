import express from "express";
import {
  createUser,
  getAllUsers,
  addToQueue,
  resetQueueNumbers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Create a new user
router.post("/createUser", createUser);

// Get all users
router.get("/getUsers/:hospitalName", getAllUsers);
router.get("/getUser/:id", getUser);

// Add user to queue for appointment
router.put("/:id/queue", addToQueue);
router.put("/reset-queue/:hospitalName", resetQueueNumbers);
router.patch("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);


export default router;
