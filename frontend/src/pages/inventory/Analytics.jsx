import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../../utils";

const Analytics = () => {
   

  const [statistics, setStatistics] = useState({
    inventoryCount: 0,
    netSales: 0,
    netRevenue: 0,
    totalInvestment: 0,
  });

  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
    fetchStatistics();
  }, []);

  const fetchAnalyticsData = () => {
    axios.get(`${baseURL}/api/analytics/events`).then((response) => {
      setAnalyticsData(response.data);
    });
  };

  const fetchStatistics = () => {
    axios.get(`${baseURL}/api/analytics`).then((response) => {
      setStatistics({
        inventoryCount: response.data.inventoryCount,
        netSales: response.data.orderedProductsAmount, // Renamed to Net Sales
        netRevenue: calculateNetRevenue(response.data.orderedProductsAmount), // Added netRevenue
        totalInvestment: calculateTotalInvestment(response.data.inventoryCount),
      });
    });
  };

  const calculateTotalInvestment = (inventoryCount) => {
    // Fetch all products and calculate average price
    axios.get(`${baseURL}/api/products`).then((response) => {
      const products = response.data;
      const totalPrices = products.reduce(
        (acc, product) => acc + product.price,
        0
      );
      const averagePrice = totalPrices / products.length;
      const totalInvestment = inventoryCount * averagePrice;
      setStatistics((prevStatistics) => ({
        ...prevStatistics,
        totalInvestment,
      }));
    });
  };

  const calculateNetRevenue = (netSales) => {
    // Fetch all orders and calculate average order value
    axios.get(`${baseURL}/api/orders`).then((response) => {
      const orders = response.data;
      const totalOrderValues = orders.reduce(
        (acc, order) => acc + order.totalPrice,
        0
      );
      const averageOrderValue = totalOrderValues / orders.length;
      const netRevenue = netSales * averageOrderValue;
      setStatistics((prevStatistics) => ({
        ...prevStatistics,
        netRevenue,
      }));
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 bg-pale-white p-4 rounded-lg">Analytics</h1>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <div className="bg-white p-4 rounded-md border">
          <h2 className="text-lg font-semibold mb-2">Inventory Count</h2>
          <p className="text-gray-700">{statistics.inventoryCount}</p>
        </div>
        <div className="bg-white p-4 rounded-md border">
          <h2 className="text-lg font-semibold mb-2">Net Sales</h2>
          <p className="text-gray-700">{statistics.netSales}</p>
        </div>
        <div className="bg-white p-4 rounded-md border">
          <h2 className="text-lg font-semibold mb-2">Net Revenue</h2>{" "}
          {/* Changed label */}
          <p className="text-gray-700">{statistics.netRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-md border">
          <h2 className="text-lg font-semibold mb-2">Total Investment</h2>
          <p className="text-gray-700">{statistics.totalInvestment}</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold my-4">Detailed Analytics Events</h2>
      <div className="block w-full overflow-x-auto">
        <table className="items-center bg-transparent w-full border-collapse">
          <thead>
            <tr>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Product ID
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Event Type
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Quantity
              </th>
              <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map((event) => (
              <tr key={event._id}>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {event.productId}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {event.eventType}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {event.quantity}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                  {event.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
