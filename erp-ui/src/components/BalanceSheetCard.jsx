import React, {useState} from "react";
import { getBalanceSheet } from "../services/api";

export default function BalanceSheetCard() {
    const [data, setData] = useState(null);

    const load = async (options = {}) => {
      const res = await getBalanceSheet(options);
      setData(res);
    }

     return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-bold text-xl mb-3">Balance Sheet</h2>

      <button onClick={() => load()} className="btn">Overall</button>
      <button onClick={() => load({ period: "monthly" })} className="btn">Monthly</button>
      <button onClick={() => load({ period: "quarterly" })} className="btn">Quarterly</button>

      {Array.isArray(data) &&
        data.map((item, i) => (
          <div key={i}>
            <p>{item.label}</p>
            <p>Assets: {item.data.total_assets}</p>
          </div>
        ))}

      {!Array.isArray(data) && data && (
        <p>Assets: {data.total_assets}</p>
      )}
    </div>
  );
}