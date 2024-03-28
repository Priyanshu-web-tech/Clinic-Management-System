import express from "express";
import {
  addNewProduct,
  getAnalytics,
  getProducts,
  orderProduct,
  restock,
} from "../controllers/productController.js";
const router = express.Router();

// Get all products
router.get("/", getProducts);
// Add a new product
router.post("/", addNewProduct);
// Example route handler using Express
router.get("/api/analytics", getAnalytics);
router.put("/restock/:productId", restock);
// order a product
router.put("/order/:productId", orderProduct);

export default router;
