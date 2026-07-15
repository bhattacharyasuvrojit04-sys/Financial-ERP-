import { useState } from "react";

export default function StatementTabs({
  result
}) {

  const [activeTab, setActiveTab] =
    useState("income");

  const tabs = [
    "income",
    "balance",
    "cashflow",
    "debt"
  ];

  return (
    <>
      <div className="flex gap-2 mb-4">

        {tabs.map(tab => (

          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab)
            }
            className={
              activeTab === tab
                ? "bg-teal-700 text-white px-3 py-2 rounded"
                : "border px-3 py-2 rounded"
            }
          >
            {tab}
          </button>

        ))}

      </div>

      <pre className="text-xs bg-white p-4 rounded border">
        {JSON.stringify(
          result,
          null,
          2
        )}
      </pre>

    </>
  );
}