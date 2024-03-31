// src/pages/ProductTab.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";


const ProductTab = () => {
  const [products, setProducts] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
   


  useEffect(() => {
    fetchProducts();
    fetchAnalyticsData();
  }, []);

  const fetchProducts = () => {
    axios.get(`/api/products`).then((response) => {
      setProducts(response.data);
    });
  };

  const fetchAnalyticsData = () => {
    axios.get(`/api/analytics`).then((response) => {
      setAnalyticsData(response.data);
    });
  };

  const handleOrderProduct = (productId, orderQuantity) => {
    axios
      .post(`/api/orders`, {
        productId,
        eventType: "order",
        quantity: orderQuantity,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        fetchProducts(); // Refresh product data after ordering
      })
      .catch((error) => {
        console.error("Error placing order:", error);
      });
  };

  const handleRestockProduct = (productId, restockQuantity) => {
    axios
      .post(`/api/restocks`, {
        productId,
        eventType: "restock",
        quantity: restockQuantity,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        fetchProducts(); // Refresh product data after restocking
      })
      .catch((error) => {
        console.error("Error restocking product:", error);
      });
  };

  const logAnalyticsEvent = (productId, eventType, quantity) => {
    const newEvent = {
      productId,
      eventType,
      quantity,
      timestamp: new Date().toISOString(),
    };

    // Send the new event to the server for logging
    axios
      .post(`/api/analytics/log`, newEvent)
      .then(() => {
        // After successful logging, fetch updated analytics data
        fetchAnalyticsData();
      })
      .catch((error) => {
        console.error("Error logging analytics event:", error);
      });
  };

  const handleQuantityChange = (productId, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === productId ? { ...p, selectedQuantity: quantity } : p
      )
    );
  };
  console.log(analyticsData);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 bg-pale-white p-4 rounded-lg">Order and Restock</h1>
      <hr />{" "}
      <div className="inline-flex flex-wrap grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-md border w-80">
            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-gray-700">
              Price: ₹{product.price} | Stock: {product.quantity} | Orders:{" "}
              {product.totalOrders} | Restock Quantity: {product.totalRestock}
            </p>
            <div className="mt-4 flex justify-around items-center gap-2">
              <div>
                <button
                 className="bg-dark focus:scale-110 flex gap-2 rounded-lg px-2 text-pale-white text-sm py-1"
                  onClick={() =>
                    handleOrderProduct(product._id, product.selectedQuantity)
                  }
                >
                  Order
                  <select
                  className="bg-pale-white px-2 rounded-full text-dark focus:outline-none"
                  id={`orderQuantity-${product._id}`}
                  onChange={(e) =>
                    handleQuantityChange(product._id, e.target.value)
                  }
                >
                  {[1, 2, 3, 5, 10].map((quantity) => (
                    <option key={quantity} value={quantity}>
                      {quantity}
                    </option>
                  ))}
                </select>
                </button>
              </div>
              <div>
                <button
                  className="bg-dark focus:scale-110 flex gap-2 rounded-lg px-2 text-pale-white text-sm py-1"
                  onClick={() =>
                    handleRestockProduct(product._id, product.selectedQuantity)
                  }
                >
                  Restock
                  <select
                  className="bg-pale-white px-2 rounded-full text-dark focus:outline-none"
                  id={`restockQuantity-${product._id}`}
                  onChange={(e) =>
                    handleQuantityChange(product._id, e.target.value)
                  }
                >
                  {[5, 10, 20, 50].map((quantity) => (
                    <option key={quantity} value={quantity}>
                      {quantity}
                    </option>
                  ))}
                </select>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTab;
