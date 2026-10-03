import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PnlStatement from "./pages/pnlStatement";
import CashFlow from "./pages/cashFlow";
import BalanceSheet from "./pages/BalanceSheet";
import Forecast from "./pages/Forecast";
import Dcf from "./pages/Dcf";
import Transactions from "./pages/Transactions";
import RatioAnalysis from "./pages/RatioAnalysis";
import AiDocumentAnalysis from "./pages/AiDocumentAnalysis";
import AiPitchDeck from "./pages/AiPitchDeck";
import ProjectFinance from "./pages/projectFinance";

import Overview from "./pages/accounting/Overview";
import Journal from "./pages/accounting/Journal";
import ChartOfAccounts from "./pages/accounting/ChartOfAccounts";
import GeneralLedger from "./pages/accounting/GeneralLedger";
import TrialBalance from "./pages/accounting/TrialBalance";
import FixedAssetRegister from "./pages/accounting/FixedAssetRegister";
import DepreciationSchedule from "./pages/accounting/DepreciationSchedule";
import Depreciation from "./pages/accounting/Depreciation";
import Masters from "./pages/Masters/Masters";
import Inventory from "./pages/Inventory/Inventory";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            
              <Dashboard />
            
          }
        />

        {/* ACCOUNTING */}
        <Route
          path="/accounting"
          element={
            <Layout>
              <Overview />
            </Layout>
          }
        />

        <Route
          path="/journal"
          element={
            <Layout>
              <Journal />
            </Layout>
          }
        />

        <Route
          path="/chart-of-accounts"
          element={
            <Layout>
              <ChartOfAccounts />
            </Layout>
          }
        />

        <Route
          path="/general-ledger"
          element={
            <Layout>
              <GeneralLedger />
            </Layout>
          }
        />

        <Route
          path="/trial-balance"
          element={
            <Layout>
              <TrialBalance />
            </Layout>
          }
        />

        <Route
          path="/inventory"
          element={
              <Layout>
                  <Inventory />
              </Layout>
          }
      />

        <Route
          path="/accounting/masters"
          element={
            <Layout>
              <Masters />
            </Layout>
          }
        />

        <Route
            path="/fixed-assets"
            element={
                <Layout>
                    <FixedAssetRegister />
                </Layout>
            }
        />

        <Route
            path="/depreciation-schedule/:assetId"
            element={
                <Layout>
                    <DepreciationSchedule />
                </Layout>
            }
        />
        <Route
            path="/depreciation"
            element={
                <Layout>
                    <Depreciation />
                </Layout>
            }
        />

        {/* REPORTING */}
        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />

        <Route
          path="/pnl"
          element={
            <Layout>
              <PnlStatement />
            </Layout>
          }
        />

        <Route
          path="/cashflow"
          element={
            <Layout>
              <CashFlow />
            </Layout>
          }
        />

        <Route
          path="/balance-sheet"
          element={
            <Layout>
              <BalanceSheet />
            </Layout>
          }
        />

        <Route
          path="/ratios"
          element={
            <Layout>
              <RatioAnalysis />
            </Layout>
          }
        />

        <Route
          path="/forecast"
          element={
            <Layout>
              <Forecast />
            </Layout>
          }
        />

        {/* ANALYTICS */}
        <Route
          path="/ai-analysis"
          element={
            <Layout>
              <AiDocumentAnalysis />
            </Layout>
          }
        />

        <Route
          path="/ai-pitch-deck"
          element={
            <Layout>
              <AiPitchDeck />
            </Layout>
          }
        />

        <Route
          path="/dcf"
          element={
            <Layout>
              <Dcf />
            </Layout>
          }
        />

        {/* TRANSACTIONS */}
        <Route
          path="/transactions"
          element={
            <Layout>
              <Transactions />
            </Layout>
          }
        />

        {/* PROJECT FINANCE */}
        <Route
          path="/project-finance"
          element={
            <Layout>
              <ProjectFinance />
            </Layout>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}