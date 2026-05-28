import React, {use, useState} from "react";
import { applyDepreciation } from "../services/api";

export default function DepreciationCard() {
    const [asset, setAsset] = useState("");
    const [amount, setAmount] = useState("");

    const handleDepreciation = async () => {
        await applyDepreciation(asset,Number(amount));
        setAsset("");
        setAmount("");
        alert("Depreciation Applied");
    };

     return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <h2 className="text-xl font-bold mb-4">Apply Depreciation</h2>

      <input
        className="w-full border p-2 mb-3 rounded"
        placeholder="Asset Name (e.g. furniture)"
        value={asset}
        onChange={(e) => setAsset(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-3 rounded"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={handleDepreciation}
        className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Apply
      </button>
    </div>
  );
}
    