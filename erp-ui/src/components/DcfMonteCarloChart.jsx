import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function createHistogram(values, bins = 20) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / bins;

  const hist = Array(bins).fill(0);

  values.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx >= bins) idx = bins - 1;
    hist[idx]++;
  });

  return hist.map((count, i) => ({
    range: `${(min + i * step).toFixed(0)}`,
    count
  }));
}

export default function DcfMonteCarloChart({ data }) {
  if (!data) return null;

  const histData = createHistogram(data.values);

  return (
    <div>
      <h3>Monte Carlo Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={histData}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count"
              fill="#03c976" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}