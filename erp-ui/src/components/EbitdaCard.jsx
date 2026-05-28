import React,{useState} from "react";
import { getEbitda } from "../services/api";

export default function EbitdaCard() {
    const [data, setData] = useState(null);

    const loadEbitda = async () => {
        const res = await getEbitda();
        setData(res);
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-xl font-bold mb-4">EBITDA</h2>

        <button
            onClick={loadEbitda}
            className="bg-indigo-500 text-white px-4 py-2 rounded mb-4"
        >
            Load EBITDA
        </button>

        {data && (
            <div className="space-y-2">
            <p>Profit: {data.profit}</p>
            <p>Depreciation: {data.depreciation}</p>
            <p>Interest: {data.interest}</p>
            <hr />
            <p className="font-bold text-lg">EBITDA: {data.ebitda}</p>
            </div>
        )}
        </div>
    );
};
