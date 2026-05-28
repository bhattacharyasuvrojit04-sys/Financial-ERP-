import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { runDcf } from "../services/api";
import { runDcfSensitivity } from "../services/api";
import DcfInput from "../components/DcfInput";
import DcfSummary from "../components/DcfSummary";
import DcfChart from "../components/DcfChart";
import DcfHeatmap from "../components/DcfHeatmap";
import { runMonteCarlo } from "../services/api";
import DcfMonteCarloChart from "../components/DcfMontecarloChart";
import DcfMonteCarloSummary from "../components/DcfMonteCarloSummary";

export default function Dcf() {
    const [inputs, setInputs] = useState({
        revenue: 100,
        revenue_growth: 10,
        ebitda_margin: 25,
        tax_rate: 25,
        capex_pct: 5,
        nwc_pct: 2,
        wacc: 8,
        terminal_growth: 2.5,
        years: 5,
        net_debt: 50,
        shares: 50
    });

    const [results, setResults] = useState(null);
    const [sensitivity, setSensitivity] = useState(null);
    const [mc, setMc] = useState(null);
    useEffect(() => {
        calculate();
    },[inputs]);

    const calculate = async () => {
        try {
            const res = await runDcf(inputs)
            console.log("DCF RESULT:", res);
            setResults(res);

            const sens = await runDcfSensitivity(inputs);
            setSensitivity(sens);

            const mcRes = await runMonteCarlo(inputs);
            setMc(mcRes);
        } catch (err) {
            console.error(err);
        }
    };

     return (
    <Layout title="DCF Valuation">

      {/* INPUT PANEL */}
      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h2>DCF Valuation Model</h2>
        <DcfInput inputs={inputs} setInputs={setInputs} />
      </div>

      {/* SUMMARY */}
      {results && (
        <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
          <h3>Valuation Summary</h3>
          <DcfSummary data={results} />
        </div>
      )}

      {/* CHART */}
      {results && (
        <div className="card" style={{ padding: "20px" }}>
          <h3>Free Cash Flow Projection</h3>
          <DcfChart data={results.yearly_fcf} />
        </div>
      )}

      {sensitivity && (
        <div className="card" style={{ padding: "20px", marginTop: "20px" }}>
          <DcfHeatmap data={sensitivity} />
        </div>
      )}

      {mc && (
        <div className="card" style={{ padding: "20px", marginTop: "20px" }}>
          <h3>Monte Carlo Analysis</h3>

          <DcfMonteCarloSummary data={mc} />
          <DcfMonteCarloChart data={mc} />
        </div>
      )}

    </Layout>
  );
    
}