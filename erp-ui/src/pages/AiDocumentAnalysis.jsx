import { useState } from "react";
import Layout from "../components/Layout";
import { uploadFinancialDocument, runPeerBenchmark } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip,Legend, ResponsiveContainer } from "recharts";

export default function AiDocumentAnalysis() {

  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [benchmark, setBenchmark] = useState(null);

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    try {

      const res = await uploadFinancialDocument(file);

      console.log("AI RESPONSE:", res);

      setResults(res);

    } catch (err) {

      console.error("UPLOAD ERROR:", err);

    } finally {

      setLoading(false);

    }
  };

  const handleBenchmark = async () => {
    try {
      const payload = {
        industry: "technology",
        assumptions: {
          revenue_growth:10,
          ebitda_margin:
            results?.ratios?.ebitda_margin || 0,
          capex_pct:
            results?.ratios?.capex_pct || 0 
        }
      };
      console.log("BENCHMARK PAYLOAD:", payload);
      console.log(JSON.stringify(payload, null, 2))

      const res = await runPeerBenchmark(payload);

      console.log("BENCHMARK RESPONSE:");
      console.log(res);

      setBenchmark(res);

    } catch (err) {
      console.error("BENCHMARK ERROR:", err);
  }
  };

  const ChartData = benchmark ? [
    {
      metric: "Revenue Growth",
      company: benchmark.revenue_growth?.value ||0,
      Industry: benchmark.revenue_growth?.peer_median ||0

    },
    {
      metric: "EBITDA Margin",
      company: benchmark.ebitda_margin?.value ||0,
      Industry: benchmark.ebitda_margin?.peer_median ||0
    },
    {
      metric: "Capex %",
      company: benchmark.capex_pct?.value ||0,
      Industry: benchmark.capex_pct?.peer_median ||0
    }
  ] : [];

  return (
  <Layout title="AI Financial Analysis">

    <div
      style={{
        padding: "25px"
      }}
    >

      {/* Upload Section */}

      <div
        className="card"
        style={{
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "25px"
        }}
      >

        <h2>AI Financial Document Analysis</h2>

        <p>
          Upload annual reports, 10-K filings, investor presentations,
          or earnings call transcripts.
        </p>

        <div
          style={{
            border: "2px dashed #d1d5db",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            marginTop: "20px"
          }}
        >

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && (
            <div style={{ marginTop: "10px" }}>
              Selected: {file.name}
            </div>
          )}

        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          {loading ? "Analyzing..." : "Analyze Financial Document"}
        </button>

      </div>

      {results && (

        <>

          {/* KPI CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "20px",
              marginBottom: "25px"
            }}
          >

            <div className="card">
              <h4>Revenue</h4>
              <h2>
                {results.metrics?.revenue?.toLocaleString()}
              </h2>
            </div>

            <div className="card">
              <h4>EBITDA Margin</h4>
              <h2>
                {results.ratios?.ebitda_margin?.toFixed(2)}%
              </h2>
            </div>

            <div className="card">
              <h4>Net Margin</h4>
              <h2>
                {results.ratios?.net_margin?.toFixed(2)}%
              </h2>
            </div>

            <div className="card">
              <h4>Debt</h4>
              <h2>
                {results.metrics?.debt?.toLocaleString()}
              </h2>
            </div>

          </div>

          {/* AI COMMENTARY */}

          <div
            className="card"
            style={{
              padding: "25px",
              marginBottom: "25px"
            }}
          >

            <h2>AI Commentary</h2>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit"
              }}
            >
              {results.commentary}
            </pre>

            <button
              onClick={handleBenchmark}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "8px"
              }}
            >
              Run Peer Benchmark
            </button>

          </div>

        </>

      )}

      {benchmark && (

        <>

          {/* BAR CHART */}

          <div
            className="card"
            style={{
              padding: "25px",
              marginBottom: "25px"
            }}
          >

            <h2>Benchmark Comparison</h2>

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <BarChart data={ChartData}>

                <XAxis dataKey="metric" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="company"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="Industry"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* PEER TABLE */}

          <div
            className="card"
            style={{
              padding: "25px",
              marginBottom: "25px"
            }}
          >

            <h2>Peer Benchmark Results</h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >

              <thead>

                <tr>

                  <th>Metric</th>

                  <th>Company</th>

                  <th>Median</th>

                  <th>Position</th>

                  <th>Difference</th>

                </tr>

              </thead>

              <tbody>

                {Object.entries(benchmark).map(
                  ([metric, data]) => (

                    <tr key={metric}>

                      <td>{metric}</td>

                      <td>{data.value}</td>

                      <td>{data.peer_median}</td>

                      <td>{data.position}</td>

                      <td>{data.difference}</td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* AI VERDICT */}

          <div
            className="card"
            style={{
              padding: "25px"
            }}
          >

            <h2>AI Investment Verdict</h2>

            {results?.ratios?.ebitda_margin > 25 ? (

              <div>

                <h1>🟢 BUY</h1>

                <p>
                  EBITDA Margin is above industry benchmark.
                </p>

              </div>

            ) : (

              <div>

                <h1>🟡 HOLD</h1>

                <p>
                  Performance is close to industry averages.
                </p>

              </div>

            )}

          </div>

        </>

      )}

    </div>

  </Layout>
);
}

/* ================= BUTTON STYLES ================= */

const acceptBtn = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const rejectBtn = {
  padding: "10px 18px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const editBtn = {
  padding: "10px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

/* ================= HELPERS ================= */

function formatName(name) {

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

}