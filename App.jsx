import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PnlStatement from "./pages/pnlStatement";
import CashFlow from "./pages/cashFlow";
import BalanceSheet from "./pages/BalanceSheet";
import Forecast from "./pages/Forecast";

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
      </Routes>
    </BrowserRouter>
  );
}