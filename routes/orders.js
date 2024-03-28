import express from "express";
const router = express.Router();
import { addOrder } from "../controllers/orderController.js";

router.post("/", addOrder);

export default router;
