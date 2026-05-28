import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DcfChart({ data }) {

  const chartData = data.map((val, i) => ({
    year: `Y${i + 1}`,
    fcf: val
  }));

  return (
    <div style={{ height: "300px", marginTop: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="fcf" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}