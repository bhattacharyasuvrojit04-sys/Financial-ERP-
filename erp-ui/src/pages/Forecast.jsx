import { useState } from "react";
import { getForecast } from "../services/api";

export default function Forecast() {
  const [data, setData] = useState(null);
  const [metric, setMetric] = useState("revenue");
  const [method, setMethod] = useState("growth");
  const [period, setPeriod] = useState("monthly");

  const load = async () => {
    try {
      const res = await getForecast({ metric, method, period });
      console.log("FORECAST:", res);
      setData(res);
    } catch (err) {
      console.error("Forecast error:", err);
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Forecast</h2>

      {/* 🔥 CONTROLS */}
      <div className="flex gap-2 mb-4">

        <select onChange={(e) => setMetric(e.target.value)}>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
          <option value="profit">Profit</option>
        </select>

        <select onChange={(e) => setMethod(e.target.value)}>
          <option value="growth">Growth</option>
          <option value="average">Moving Avg</option>
          <option value="linear">Linear</option>
        </select>

        <select onChange={(e) => setPeriod(e.target.value)}>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button onClick={load} className="bg-blue-500 text-white px-3 py-1 rounded">
          Run Forecast
        </button>
      </div>

      {/* 🔥 OUTPUT */}
      {data && (
        <div>
          <h3 className="font-bold text-lg">
            Forecast: {data.forecast}
          </h3>

          <div className="mt-3">
            <h4 className="font-semibold">History</h4>

            {data.history.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}