import { useEffect, useState } from "react";
import { getPnl } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function PnlChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("monthly")

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (selectedPeriod = period) => {
    try {
      // 🔥 request monthly data
      const res = await getPnl({period: selectedPeriod});

      console.log("CHART DATA:", res);

      // 🔥 transform API → chart format
      const formatted = res.map((item) => ({
        month: item.label,
        income: item.data?.summary?.operating_income || 0,
        expense: item.data?.summary?.operating_expense || 0,
      }));

      setData(formatted);

    } catch (err) {
      console.error("Chart error:", err);
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
        <h3>Profit & Loss</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => loadData("monthly")}>Monthly</button>
          <button onClick={() => loadData("quarterly")}>Quarterly</button>
          <button onClick={() => loadData("yearly")}>Yearly</button>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="income" fill="#0F6E56" radius={[4,4,0,0]} />
          <Bar dataKey="expense" fill="#E76F51" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}