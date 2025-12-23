// src/Main/StockPanel.jsx
import React, { useState } from "react";
import axios from "axios";
import StockPanelUI from "./StockPanelUI"; // Import the dumb UI

function StockPanel() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  // --- API FUNCTION ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // 1. Reset States
    setLoading(true);
    setError(null);
    setStockData(null); 

    try {
      const ticker = searchTerm.toUpperCase();

      // 2. Fire BOTH requests in parallel using Promise.allSettled
      // This is faster than waiting for one, then the other.
      const [stockRes, newsRes] = await Promise.allSettled([
        axios.get(`http://127.0.0.1:5000/api/stock/${ticker}`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://127.0.0.1:5000/api/news/${ticker}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // 3. Check Critical Failure (Stock Data)
      // If the stock price fails, the whole panel is useless, so we throw an error.
      if (stockRes.status === "rejected") {
        const status = stockRes.reason.response?.status;
        if (status === 404) throw new Error("Symbol not found.");
        if (status === 429) throw new Error("Too many requests.");
        throw new Error("Failed to fetch market data.");
      }

      // 4. Combine Data
      // If news fails (rejected), we just return an empty array [] so the UI doesn't crash.
      const combinedData = {
        ...stockRes.value.data, // stats, chart
        news: newsRes.status === "fulfilled" ? newsRes.value.data : [] 
      };

      setStockData(combinedData);

    } catch (err) {
      console.error("Stock Search Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      // 5. Stop Loading
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <StockPanelUI
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={handleSearch}
      stockData={stockData}
      loading={loading}
      error={error}
    />
  );
}

export default StockPanel;