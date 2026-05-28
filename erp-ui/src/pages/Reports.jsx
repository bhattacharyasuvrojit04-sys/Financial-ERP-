import React, { useState, useEffect } from "react";
import { getPnl } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState([]);

  const year = new Date().getFullYear();

  // ✅ Generate periods with proper date ranges
  const generatePeriods = () => {
    if (period === "monthly") {
      return [
        { name: "Jan", start: `${year}-01-01`, end: `${year}-01-31` },
        { name: "Feb", start: `${year}-02-01`, end: `${year}-02-28` },
        { name: "Mar", start: `${year}-03-01`, end: `${year}-03-31` },
        { name: "Apr", start: `${year}-04-01`, end: `${year}-04-30` },
      ];
    }

    if (period === "quarterly") {
      return [
        { name: "Q1", start: `${year}-01-01`, end: `${year}-03-31` },
        { name: "Q2", start: `${year}-04-01`, end: `${year}-06-30` },
        { name: "Q3", start: `${year}-07-01`, end: `${year}-09-30` },
        { name: "Q4", start: `${year}-10-01`, end: `${year}-12-31` },
      ];
    }

    if (period === "yearly") {
      return [
        { name: "2025", start: "2025-01-01", end: "2025-12-31" },
        { name: "2026", start: "2026-01-01", end: "2026-12-31" },
      ];
    }

    return [];
  };

  // ✅ Load data from backend
  const loadData = async () => {
    try {
      const periods = generatePeriods();
      const result = [];

      for (let p of periods) {
        const pnl = await getPnl(p.start, p.end);

        console.log("API RESPONSE:", pnl);

        result.push({
          name: p.name,
          profit: Number(pnl?.profit) || 0, // ✅ FIXED
        });
      }

      console.log("FINAL DATA:", result);

      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>

      {/* ✅ Period Selector */}
      <div className="mb-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* ✅ Chart Section */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">Profit Trend</h2>

        {/* ✅ Prevent crash if data empty */}
        {data.length > 0 ? (
          <div>
            <LineChart width={800} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
              />
            </LineChart>
          </div>
        ) : (
          <p>Loading chart...</p>
        )}
      </div>

      {/* ✅ Debug Output (REMOVE LATER) */}
      <div className="mt-6 bg-black text-green-400 p-3 text-sm rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}