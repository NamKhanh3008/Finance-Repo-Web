import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Download, AlertCircle } from "lucide-react";

// 1. Add 'token' to props
function DataVisualizer({ fileUrl, fileName, token }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [sheetName, setSheetName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 2. Pass the token in the headers
        const response = await fetch(fileUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          
          const firstSheetName = workbook.SheetNames[0];
          setSheetName(firstSheetName);
          const sheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          if (jsonData.length > 0) {
            setData(jsonData);
            setColumns(Object.keys(jsonData[0]));
          } else {
            setError("Sheet appears empty.");
          }
        };
        reader.readAsBinaryString(blob);
      } catch (err) {
        console.error(err);
        setError("Failed to parse Excel file.");
      }
    };
    if (fileUrl && token) fetchData(); // Ensure token exists before fetching
  }, [fileUrl, token]);

  const numberKeys = columns.filter(key => {
    const val = data[0]?.[key];
    return typeof val === 'number';
  });

  const labelKey = columns.find(key => !numberKeys.includes(key)) || columns[0];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <AlertCircle size={48} className="mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading Data...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white text-black p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-bold">Data Visualization</h2>
            <p className="text-sm text-gray-500">Visualizing {sheetName || "Sheet 1"}</p>
        </div>
        <a 
            href={fileUrl} 
            download={fileName}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition"
        >
            <Download size={16} /> Download Original
        </a>
      </div>

      <div className="flex-1 min-h-0 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {numberKeys.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={labelKey} tick={{fill: '#6b7280'}} />
                <YAxis tick={{fill: '#6b7280'}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                {numberKeys.map((key, index) => (
                <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={["#2563eb", "#db2777", "#16a34a"][index % 3]} 
                    strokeWidth={2}
                    dot={false}
                />
                ))}
            </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
                No numeric data found to graph.
            </div>
        )}
      </div>
    </div>
  );
}

export default DataVisualizer;