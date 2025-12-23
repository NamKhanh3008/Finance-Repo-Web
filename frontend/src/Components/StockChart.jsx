// src/Components/StockChart.jsx
import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const StockChart = ({ data }) => {
  // Determine color based on trend (Green for up, Red for down)
  // Logic: Compare last price vs first price in the dataset
  let color = "#10B981"; // Default Green (Emerald-500)
  
  if (data && data.length > 1) {
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    if (lastPrice < firstPrice) {
        color = "#EF4444"; // Red (Rose-500)
    }
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          {/* 1. Define the Gradient (The "Color" Logic) */}
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              {/* Top of chart: Solid color (30% opacity) */}
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              {/* Bottom of chart: Transparent (0% opacity) */}
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>

          {/* 2. Custom Tooltip */}
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
            itemStyle={{ color: color }}
            labelStyle={{ display: "none" }}
            formatter={(value) => [`$${value}`, "Price"]}
            cursor={{ stroke: '#374151', strokeWidth: 1 }} // Gray cursor line
          />

          {/* 3. The Graph Line & Fill */}
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" /* References the ID in <defs> */
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;