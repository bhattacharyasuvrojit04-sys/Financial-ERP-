import Layout from "../components/Layout";
import TransactionForm from "../components/Transactionform";
import RuleLearning from "../components/RuleLearning";
import DepreciationCard from "../components/Depreciation";

import PnlCard from "../components/pnl_card";
import CashflowCard from "../components/CashflowCard";
import BalanceSheetCard from "../components/BalanceSheetCard";
import KpiCard from "../components/KpiCards";
import PnlChart from "./PnlChart";
import CashflowChart from "./CashflowChart";
import { getKpi } from "../services/api";
import { useEffect, useState } from "react";
import AiInsights from "../components/AiInsights";

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  
  const loadKpi = async () => {
    try{
      const data = await getKpi();
      console.log("KPI DATA", data);
      setKpi(data);
    }catch (err){
      console.error(err)
    }
  };


  useEffect(()=> {
    loadKpi();
  }, []);

  return (
    <Layout title="Dashboard">
      {/* 🔥 KPI ROW (SEPARATE) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "20px"
      }}>
        <KpiCard
          title="Net Profit"
          value={kpi?.net_profit}
          change={0}
          positive={(kpi?.net_profit || 0) >= 0}
        />

        <KpiCard
          title="Operating Expenses"
          value={kpi?.expense}
          change={0}
          positive={false}
        />

        <KpiCard
          title="EBITDA"
          value={kpi?.ebitda}
          change={0}
          positive={(kpi?.ebitda || 0) >= 0}
        />

        <KpiCard
          title="EBITDA Margin"
          value={kpi?.ebitda_margin?.toFixed(2) + "%"}
          change={0}
          positive={(kpi?.ebitda_margin || 0) >= 0}
        />
      </div>
      

      {/* 🔥 STEP 2 — MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "20px"
      }}>

        {/* LEFT SIDE */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <AiInsights />
          <CashflowChart />
          <PnlChart/>
          
        </div>

        {/* RIGHT SIDE */}
        <div style={{
          width: "300px",
          position: "sticky",
          top: "10px",   // below topbar
          height: "fit-content"
        }}>
          <div className="card">
            <TransactionForm />
          </div>

          <div className="card">
            <p>✦ AI Teach</p>
            <RuleLearning />
          </div>

          <div className="card">
            <DepreciationCard />
          </div>
        </div>

      </div>

    </Layout>
  );
}