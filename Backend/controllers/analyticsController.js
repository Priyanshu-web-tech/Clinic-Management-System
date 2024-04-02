import Product from "../models/Product.js";
import AnalyticsEvent from "../models/Analytics.js";

export const getAnalytics = async (req, res) => {
  try {
    const [inventoryCount, orderedProductsAmount, salesAmount] =
      await Promise.all([
        Product.aggregate([
          { $group: { _id: null, inventoryCount: { $sum: "$quantity" } } },
          { $project: { _id: 0 } },
        ]),
        AnalyticsEvent.aggregate([
          { $match: { eventType: "order" } },
          {
            $group: { _id: null, orderedProductsAmount: { $sum: "$quantity" } },
          },
          { $project: { _id: 0 } },
        ]),
        AnalyticsEvent.aggregate([
          { $match: { eventType: "restock" } },
          { $group: { _id: null, salesAmount: { $sum: "$quantity" } } },
          { $project: { _id: 0 } },
        ]),
      ]);

    res.json({
      inventoryCount:
        inventoryCount.length > 0 ? inventoryCount[0].inventoryCount : 0,
      orderedProductsAmount:
        orderedProductsAmount.length > 0
          ? orderedProductsAmount[0].orderedProductsAmount
          : 0,
      salesAmount: salesAmount.length > 0 ? salesAmount[0].salesAmount : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const events = async (req, res) => {
  try {
    const analyticsEvents = await AnalyticsEvent.find();
    res.json(analyticsEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const log = async (req, res) => {
  try {
    const { productId, eventType, quantity } = req.body;
    const newEvent = new AnalyticsEvent({
      productId,
      eventType,
      quantity,
    });
    await newEvent.save();

    res.json({ message: "Event logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
