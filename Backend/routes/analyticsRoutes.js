import express from "express";
import {
  events,
  getAnalytics,
  log,
} from "../controllers/analyticsController.js";
const router = express.Router();

// Analytics route
router.get("/", getAnalytics);
// Events route
router.get("/events", events);
// Log route
router.post("/log", log);

export default router;
