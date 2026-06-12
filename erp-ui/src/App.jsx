import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PnlStatement from "./pages/pnlStatement";
import CashFlow from "./pages/cashFlow";
import BalanceSheet from "./pages/BalanceSheet";
import Forecast from "./pages/Forecast";
import Dcf from "./pages/Dcf"
import Transactions from "./pages/Transactions";
import RatioAnalysis from "./pages/RatioAnalysis";
import AiDocumentAnalysis from "./pages/AiDocumentAnalysis";
import AiPitchDeck from "./pages/AiPitchDeck";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/pnl" element={<PnlStatement />} />
        <Route path="/cashflow" element={<CashFlow />} />
        <Route path="/balance-sheet" element={<BalanceSheet />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/dcf" element={<Dcf/>}/>
        <Route path= "/transactions" element={<Transactions />} />
        <Route path="/ratios" element={<RatioAnalysis />} />
        <Route path="/ai-analysis" element={<AiDocumentAnalysis />} />
        <Route path="/ai-pitch-deck" element={<AiPitchDeck />} />
      </Routes>
    </BrowserRouter>
  );
}