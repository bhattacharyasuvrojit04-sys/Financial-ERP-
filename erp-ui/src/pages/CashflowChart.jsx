import { useEffect, useState } from "react";
import { getCashFlow } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function CashflowChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    loadData("monthly");
  }, []);

  const loadData = async (selectedPeriod) => {
    try {
      const res = await getCashFlow({ period: selectedPeriod });

      console.log("CASHFLOW:", res[0]);

      const formatted = res.map((item) => ({
        label: item.label,
        operating: item.data?.summary?.operating_cash_flow || 0,
        investing: item.data?.summary?.investing_cash_flow || 0,
        financing: item.data?.summary?.financing_cash_flow || 0,
        }));

      setData(formatted);
      setPeriod(selectedPeriod);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card" style={{ padding: "16px" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px"
      }}>
        <h3>Cash Flow</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => loadData("monthly")}>Monthly</button>
          <button onClick={() => loadData("quarterly")}>Quarterly</button>
          <button onClick={() => loadData("yearly")}>Yearly</button>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="operating" fill="#0F6E56" />
          <Bar dataKey="investing" fill="#F4A261" />
          <Bar dataKey="financing" fill="#E76F51" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}