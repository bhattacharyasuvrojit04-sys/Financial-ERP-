import React, {useState} from "react";
import { getCashFlow } from "../services/api";

export default function CashflowCard() {
    const [data, setData] = useState(null);

    const load = async (option = {}) => {
     try{
        const res = await getCashFlow(option);
        console.log("Cash Flow Data:", res);
        setData(res);
     } catch(err){
        console.error("Error loading cash flow:", err);
     }
    };
   return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="font-bold text-xl mb-3">Cash Flow</h2>

      <button onClick={() => load()} className="btn">Overall</button>
      <button onClick={() => load({ period: "monthly" })} className="btn">Monthly</button>
      <button onClick={() => load({ period: "quarterly" })} className="btn">Quarterly</button>

      {/* ARRAY */}
      {Array.isArray(data) &&
        data.map((item, i) => (
          <div key={i}>
            <p>{item.label}</p>
            <p>Net Cash: {item.data.net_cash_flow}</p>
          </div>
        ))}

      {/* SINGLE */}
      {!Array.isArray(data) && data && (
        <p>Net Cash: {data.net_cash_flow}</p>
      )}
    </div>
  );
}