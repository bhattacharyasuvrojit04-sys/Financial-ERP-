const BASE_URL = "http://127.0.0.1:8000";

export const addTransaction = async (data) => {
    await fetch(`${BASE_URL}/transaction`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
};

export const getForecast = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`http://localhost:8000/forecast?${query}`);
  return res.json();
};

export const getPnl = async ({mode, period, start_date, end_date, use_driver} = {}) => {
    let url =  `${BASE_URL}/pnl`;
    const params = new URLSearchParams();

    if(mode) params.append("mode", mode);
    if (period) params.append("period", period);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);

    if  (use_driver) params.append("use_driver", "true");

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        const errortext = await res.text();
        console.error("BACKEND ERROR:", errortext);
        throw new Error(`Failed to fetch PnL data: ${errortext}`);
    }

    return res.json();
};

export const getBalanceSheet = async ({period} = {})=> {
    let url = `${BASE_URL}/balance-sheet`;
    if (period) url += `?period=${period}`;
    const res = await fetch(url);
    return res.json();
};

export const getCashFlow = async({period} = {}) => {
    let url = `${BASE_URL}/cashflow`;
    if (period) url += `?period=${period}`;
    const res = await fetch(url);
    return res.json();
}

export const applyDepreciation = async(asset_name,amount) => {
    const res = await fetch (`${BASE_URL}/depreciation`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({asset_name, amount}),
    });
    return res.json();
};

export const getEbitda = async() => {
    const res = await fetch (`${BASE_URL}/ebitda`);
    return res.json();
}

export const learnRule = async (data)=> {
    await fetch (`${BASE_URL}/learn`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data), 
    });
};

export const createDriver = async(data) => {
    const res = await fetch (`${BASE_URL}/drivers`, {
        method: "POST",
        headers: {
             "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if(!res.ok) {
        const err = await res.text();
        console.error("Driver API Error:", err);
        throw new Error(err);
    }
    return res.json();
}

export const getPnlPeriodic = async (period = "monthly")=> {
    const res = await fetch( `http://localhost:8000/pnl?period=${period}`);
    return res.json();
};

export const getKpi = async() =>{
    const res = await fetch (`${BASE_URL}/kpi`);
    return res.json();
}

export const runDcf = async(payload)=> {
    const res = await fetch("http://127.0.0.1:8000/dcf", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
}

export const runDcfSensitivity = async (payload) => {
    const res = await fetch ("http://127.0.0.1:8000/dcf/sensitivity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
    });

    return res.json();
}

export const runMonteCarlo = async (payload) => {
    const res = await fetch ("http://127.0.0.1:8000/dcf/monte-carlo", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export const getTransactions = async ()=>{
    const res = await fetch(`${BASE_URL}/transactions`);
    return res.json();
};

export const deleteTransaction = async(id)=>{
    const res = await fetch (`${BASE_URL}/transaction/${id}`,{
        method: "DELETE"
    });
    return res.json();
}

export const getRatios = async() => {
    const res = await fetch (`${BASE_URL}/ratios`);
    return res.json();
}

export const getAiInsights = async() => {
    const res = await fetch (`${BASE_URL}/ai-insights`);
    return res.json();
}

export const uploadFinancialDocument = async(file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/ai/upload-financial-doc`, {
        method: "POST",
        body: formData,
    });
    return res.json();
};

export const runPeerBenchmark = async(payload) => {

    const res = await fetch(`${BASE_URL}/ai/peer-benchmark`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function generatePitchDeck(file){
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/ai/generate-pitch-deck`, {
        method: "POST",
        body: formData
    });
    return response.json();
}