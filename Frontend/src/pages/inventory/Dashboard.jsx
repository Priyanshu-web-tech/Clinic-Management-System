import React, { useState, useEffect } from "react";
import axios from "axios";


const Dashboard = () => {
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/products`,{
      withCredentials: true 

    }).then((response) => {
      setProducts(response.data);
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = () => {
    axios.post(`${import.meta.env.VITE_BASE_URL}/api/products`, newProduct,{
      withCredentials: true 
    }).then((response) => {
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
      });
    });
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold mb-4 bg-pale-white p-4 rounded-lg">
          Add Products
        </h1>
        <hr />

        <div className="flex-col items-center my-4">
          <div className="mb-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Product Name"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Product Description"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Product Price"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              placeholder="Product Quantity"
              className="w-full px-3 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 text-sm font-medium text-white bg-dark border rounded-md"
          >
            Add Product
          </button>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">View All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-md border">
            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-gray-700">
              Price: ₹{product.price} | Stock: {product.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
