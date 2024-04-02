import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const addNewProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
    });
    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await Product.aggregate([
      {
        $group: {
          _id: null,
          inventoryCount: { $sum: "$quantity" },
          orderedProductsAmount: { $sum: "$quantity" }, // Assuming 'quantity' represents ordered quantity
          salesAmount: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
        },
      },
    ]);

    if (analyticsData.length > 0) {
      res.json(analyticsData[0]); // Return the first result (should be only one result)
    } else {
      res.json({}); // Return an empty object if no data is found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const restock = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid quantity for restocking." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    await product.restock(quantity);

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const orderProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid order quantity." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    await product.order(quantity);

    res.json(product);
  } catch (error) {
    if (error.message === "Insufficient stock for the order.") {
      return res
        .status(400)
        .json({ error: "Insufficient stock for the order." });
    }
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
