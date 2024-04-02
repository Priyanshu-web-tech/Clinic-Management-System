import Order from "../models/Order.js";

export const addOrder = async (req, res) => {
  try {
    const { productId, eventType, quantity, timestamp } = req.body;

    // Create a new order instance
    const newOrder = new Order({
      productId,
      eventType,
      orderValue,
      quantity,
      timestamp,
    });

    // Save the order to the database
    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
