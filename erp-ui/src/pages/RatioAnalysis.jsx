import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getRatios } from "../services/api";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

export default function RatioAnalysis() {

  const [data, setData] = useState(null);

  const loadRatios = async () => {
    try {
      const res = await getRatios();
      console.log(res);
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRatios();
  }, []);

  if (!data) {
    return (
      <Layout title="Ratio Analysis">
        <p>Loading...</p>
      </Layout>
    );
  }

  const radarData = [
    {
      ratio: "Current",
      value: data.liquidity.current_ratio
    },
    {
      ratio: "Quick",
      value: data.liquidity.quick_ratio
    },
    {
      ratio: "ROA",
      value: data.profitability.roa
    },
    {
      ratio: "ROE",
      value: data.profitability.roe
    },
    {
      ratio: "Net Margin",
      value: data.profitability.net_margin
    }
  ];

  const leverageData = [
    {
      name: "Debt/Equity",
      value: data.leverage.debt_to_equity
    }
  ];

  return (
    <Layout title="Financial Ratio Analysis">

      {/* KPI CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "20px",
        marginBottom: "20px"
      }}>

        <RatioCard
          title="Current Ratio"
          value={data.liquidity.current_ratio}
        />

        <RatioCard
          title="Quick Ratio"
          value={data.liquidity.quick_ratio}
        />

        <RatioCard
          title="ROA"
          value={data.profitability.roa + "%"}
        />

        <RatioCard
          title="ROE"
          value={data.profitability.roe + "%"}
        />

        <RatioCard
          title="Net Margin"
          value={data.profitability.net_margin + "%"}
        />

      </div>

      {/* CHART GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px"
      }}>

        {/* RADAR */}
        <div className="card" style={{ padding: "20px" }}>
          <h3>Financial Health Radar</h3>

          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="ratio" />
              <Radar
                dataKey="value"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="card" style={{ padding: "20px" }}>
          <h3>Leverage Analysis</h3>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={leverageData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </Layout>
  );
}

function RatioCard({ title, value }) {
  return (
    <div className="card" style={{
      padding: "20px",
      borderRadius: "12px"
    }}>
      <div style={{
        color: "#666",
        marginBottom: "10px"
      }}>
        {title}
      </div>

      <div style={{
        fontSize: "28px",
        fontWeight: "700"
      }}>
        {value}
      </div>
    </div>
  );
}