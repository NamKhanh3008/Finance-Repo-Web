// src/Main/StockPanelUI.jsx
import React from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import StockChart from "../Components/StockChart"; 
import NewsFeed from "../Components/NewsFeed"; // <--- 1. Import NewsFeed

function StockPanelUI({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  stockData, 
  loading, 
  error 
}) {

  // Helper to format big numbers
  const formatNumber = (num) => {
    if (!num) return "-";
    if (num > 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num > 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num > 1e6) return (num / 1e6).toFixed(2) + "M";
    return num.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700 w-80 shrink-0">
      
      {/* --- 1. SEARCH BAR --- */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 shrink-0">
        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
          Market Data
        </h2>
        <form onSubmit={onSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            placeholder="Search (e.g. AAPL)"
            className="w-full bg-gray-800 text-white text-sm rounded-md pl-9 pr-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-500"
          />
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
        </form>
      </div>

      {/* --- 2. CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
        
        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <span className="text-xs">Fetching market data...</span>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !stockData && !error && (
            <div className="text-gray-500 text-center mt-10 text-sm italic">
                Enter a symbol to view chart & stats.
            </div>
        )}

        {/* DATA DISPLAY */}
        {stockData && !loading && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* A. HEADER (Price & Change) */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                      {stockData.stats.symbol}
                    </h1>
                    <p className="text-gray-400 text-xs font-medium truncate w-32">
                      {stockData.stats.shortName}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-mono text-white font-semibold">
                      ${stockData.stats.currentPrice}
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-1 ${
                        stockData.stats.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                        {stockData.stats.change >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {stockData.stats.change > 0 ? "+" : ""}
                        {stockData.stats.change} ({stockData.stats.changePercent}%)
                    </div>
                </div>
              </div>
            </div>

            {/* B. THE GRAPH */}
            <div className="-mx-2">
                <StockChart data={stockData.chart} />
            </div>

            {/* C. STATS GRID */}
            <div>
                <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-3 tracking-widest border-b border-gray-700 pb-1">
                  Key Statistics
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex justify-between border-b border-gray-700 pb-1">
                        <span className="text-gray-500 text-xs">Open</span>
                        <span className="text-gray-200 font-mono text-xs">{stockData.stats.open}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-1">
                        <span className="text-gray-500 text-xs">High</span>
                        <span className="text-gray-200 font-mono text-xs">{stockData.stats.high}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-1">
                        <span className="text-gray-500 text-xs">Low</span>
                        <span className="text-gray-200 font-mono text-xs">{stockData.stats.low}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-700 pb-1">
                        <span className="text-gray-500 text-xs">Mkt Cap</span>
                        <span className="text-gray-200 font-mono text-xs">{formatNumber(stockData.stats.marketCap)}</span>
                    </div>
                </div>
            </div>

            {/* D. NEWS SECTION (New!) */}
            <div>
                <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-2 tracking-widest border-b border-gray-700 pb-1 flex justify-between items-center">
                  <span>Latest News</span>
                  <span className="text-[9px] bg-blue-900/50 text-blue-300 px-1.5 rounded">LIVE</span>
                </h3>
                
                {/* 2. Pass 'stockData.news' (You must update logic to fetch this!) */}
                <NewsFeed news={stockData.news} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default StockPanelUI;