import { useEffect, useState } from "react";
import { getPnl } from "../services/api";

export default function PnlCard() {
  const [data, setData] = useState(null);
  const [useDriver, setUseDriver] = useState(false);

  useEffect(() => {
    load();
  }, [useDriver]);

  const load = async () => {
    try {
      const res = await getPnl({ use_driver: useDriver });
      setData(res.summary);
    } catch (err) {
      console.error("PnL error:", err);
    }
  };

  if (!data) return <div className="text-sm text-gray-400">Loading...</div>;

  const revenue = data.operating_income || 0;
  const expense = data.operating_expense || 0;
  const profit = data.profit || 0;

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-600">
          Profit & Loss
        </h3>

        <button
          onClick={() => setUseDriver(!useDriver)}
          className="text-xs px-2 py-1 border rounded text-gray-600"
        >
          {useDriver ? "Driver Mode" : "Accounting Mode"}
        </button>
      </div>

      {/* METRICS */}
      <div className="space-y-2 text-sm">

        <div className="flex justify-between">
          <span className="text-gray-500">Revenue</span>
          <span>{revenue}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Expenses</span>
          <span>{expense}</span>
        </div>

        <div className="flex justify-between font-medium text-gray-800">
          <span>Profit</span>
          <span>{profit}</span>
        </div>

      </div>

    </div>
  );
}