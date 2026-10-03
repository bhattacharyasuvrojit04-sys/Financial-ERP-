const BASE_URL = "http://127.0.0.1:8000";


// =====================================================
// TRANSACTIONS
// =====================================================

export const addTransaction = async (data) => {
    const response = await fetch(`${BASE_URL}/transaction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add transaction");
    }

    return response.json();
};


export const getTransactions = async () => {
    const response = await fetch(`${BASE_URL}/transactions`);

    if (!response.ok) {
        throw new Error("Failed to fetch transactions");
    }

    return response.json();
};


export const deleteTransaction = async (id) => {
    const response = await fetch(
        `${BASE_URL}/transaction/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete transaction");
    }

    return response.json();
};


// =====================================================
// ACCOUNTS
// =====================================================

export async function getAccounts() {

    const response = await fetch(
        `${BASE_URL}/accounts`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch accounts");
    }

    return response.json();
}

export async function createAccount(payload) {

  const response = await fetch(
    `${BASE_URL}/accounts`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data?.detail ||
      "Failed to create account"
    );

  }

  return data;
}


// =====================================================
// JOURNAL
// =====================================================

export async function postJournalEntry(payload) {

    const response = await fetch(
        `${BASE_URL}/journal`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail || "Failed to post journal entry"
        );
    }

    return data;
}

// =====================================================
// GENERAL LEDGER
// =====================================================

export const getGeneralLedger = async (accountId = "") => {

    const url = accountId
        ? `${BASE_URL}/general-ledger?account_id=${accountId}`
        : `${BASE_URL}/general-ledger`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            errorText || "Failed to fetch general ledger"
        );
    }

    return response.json();
};


// =====================================================
// TRIAL BALANCE
// =====================================================

export const getTrialBalance = async () => {

    const response = await fetch(
        `${BASE_URL}/trial-balance`
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            errorText || "Failed to fetch trial balance"
        );
    }

    return response.json();
};

// =====================================================
// ACCOUNTING OVERVIEW
// =====================================================

export const getAccountingOverview = async () => {

    const response = await fetch(
        `${BASE_URL}/accounting-overview`
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch accounting overview"
        );
    }

    return response.json();
};

// =====================================================
// PROFIT & LOSS
// =====================================================

export const getPnl = async ({
    mode,
    period,
    start_date,
    end_date,
    use_driver,
} = {}) => {

    let url = `${BASE_URL}/pnl`;

    const params = new URLSearchParams();

    if (mode) {
        params.append("mode", mode);
    }

    if (period) {
        params.append("period", period);
    }

    if (start_date) {
        params.append("start_date", start_date);
    }

    if (end_date) {
        params.append("end_date", end_date);
    }

    if (use_driver !== undefined) {
        params.append(
            "use_driver",
            String(use_driver)
        );
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {

        const errorText = await response.text();

        console.error(
            "P&L BACKEND ERROR:",
            errorText
        );

        throw new Error(
            `Failed to fetch P&L data: ${errorText}`
        );
    }

    return response.json();
};

/* =========================================================
   FIXED ASSETS
========================================================= */

export const getFixedAssets = async () => {
    const response = await fetch(`${BASE_URL}/fixed-assets`);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch fixed assets");
    }

    return response.json();
};


export const createFixedAsset = async (payload) => {
    const response = await fetch(`${BASE_URL}/fixed-assets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            "Failed to create fixed asset"
        );
    }

    return data;
};


/* =========================================================
   DEPRECIATION SCHEDULE
========================================================= */

export const getAssetSchedule = async (assetId) => {
    const response = await fetch(
        `${BASE_URL}/fixed-assets/${assetId}/depreciation-schedule`
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            text || "Failed to fetch depreciation schedule"
        );
    }

    return response.json();
};


/* =========================================================
   POST DEPRECIATION JOURNAL
========================================================= */

export const postDepreciationJournal = async (scheduleId) => {
    const response = await fetch(
        `${BASE_URL}/depreciation-schedule/${scheduleId}/post`,
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail ||
            data?.message ||
            "Failed to post depreciation journal"
        );
    }

    return data;
};



// =====================================================
// PERIODIC P&L
// =====================================================

export const getPnlPeriodic = async (
    period = "monthly"
) => {

    const response = await fetch(
        `${BASE_URL}/pnl?period=${encodeURIComponent(period)}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch periodic P&L");
    }

    return response.json();
};


// =====================================================
// BALANCE SHEET
// =====================================================

export const getBalanceSheet = async ({
    period,
} = {}) => {

    let url = `${BASE_URL}/balance-sheet`;

    if (period) {
        url += `?period=${encodeURIComponent(period)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Failed to fetch balance sheet: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// CASH FLOW
// =====================================================



export const getCashFlow = async ({ period } = {}) => {
  let url = `${BASE_URL}/cashflow`;

  if (period) {
    url += `?period=${period}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cash Flow API Error:", errorText);

    throw new Error(
      `Failed to fetch Cash Flow: ${errorText}`
    );
  }

  return response.json();
};


// =====================================================
// FORECAST
// =====================================================

export const getForecast = async (params = {}) => {

    const query = new URLSearchParams(params).toString();

    const url = query
        ? `${BASE_URL}/forecast?${query}`
        : `${BASE_URL}/forecast`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Failed to fetch forecast: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// DEPRECIATION
// =====================================================

export const applyDepreciation = async (
    asset_name,
    amount
) => {

    const response = await fetch(
        `${BASE_URL}/depreciation`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                asset_name,
                amount,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Failed to apply depreciation: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// EBITDA
// =====================================================

export const getEbitda = async () => {

    const response = await fetch(
        `${BASE_URL}/ebitda`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch EBITDA");
    }

    return response.json();
};


// =====================================================
// RULE LEARNING
// =====================================================

export const learnRule = async (data) => {

    const response = await fetch(
        `${BASE_URL}/learn`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Failed to learn rule: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// DRIVERS
// =====================================================

export const createDriver = async (data) => {

    const response = await fetch(
        `${BASE_URL}/drivers`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        console.error(
            "Driver API Error:",
            errorText
        );

        throw new Error(errorText);
    }

    return response.json();
};


// =====================================================
// KPI
// =====================================================

export const getKpi = async () => {

    const response = await fetch(
        `${BASE_URL}/kpi`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch KPI");
    }

    return response.json();
};


// =====================================================
// RATIOS
// =====================================================

export const getRatios = async () => {

    const response = await fetch(
        `${BASE_URL}/ratios`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch ratios");
    }

    return response.json();
};


// =====================================================
// AI INSIGHTS
// =====================================================

export const getAiInsights = async () => {

    const response = await fetch(
        `${BASE_URL}/ai-insights`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch AI insights");
    }

    return response.json();
};


// =====================================================
// AI DOCUMENT ANALYSIS
// =====================================================

export const uploadFinancialDocument = async (file) => {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    const response = await fetch(
        `${BASE_URL}/ai/upload-financial-doc`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Document upload failed: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// PEER BENCHMARK
// =====================================================

export const runPeerBenchmark = async (payload) => {

    const response = await fetch(
        `${BASE_URL}/ai/peer-benchmark`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Peer benchmark failed: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// AI PITCH DECK
// =====================================================

export async function generatePitchDeck(file) {

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    const response = await fetch(
        `${BASE_URL}/ai/generate-pitch-deck`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Pitch deck generation failed: ${errorText}`
        );
    }

    return response.json();
}


// =====================================================
// DCF
// =====================================================

export const runDcf = async (payload) => {

    const response = await fetch(
        `${BASE_URL}/dcf`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `DCF failed: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// DCF SENSITIVITY
// =====================================================

export const runDcfSensitivity = async (payload) => {

    const response = await fetch(
        `${BASE_URL}/dcf/sensitivity`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `DCF sensitivity failed: ${errorText}`
        );
    }

    return response.json();
};


// =====================================================
// MONTE CARLO
// =====================================================

export const runMonteCarlo = async (payload) => {

    const response = await fetch(
        `${BASE_URL}/dcf/monte-carlo`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Monte Carlo failed: ${errorText}`
        );
    }

    return response.json();
};



export async function saveProject(payload) {

    const response = await fetch (`${BASE_URL}/project-finance/project`, {
        method: "POST",
        headers: {
             "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok){
        const errorText = await response.text();

        console.error(errorText);

        throw new Error(errorText);
    }
    
    return response.json();
}

export async function analyzeSavedProject(projectId) {

    const response = await fetch(`${BASE_URL}/project-finance/project/${projectId}/analyze`, {
        method: "POST"
    });
    
    if (!response.ok){
        throw new Error("Analysis Failed");
    }

    return response.json();

}

export async function getProjects() {

    const response = await fetch (`${BASE_URL}/project-finance/projects`);

    if (!response.ok) {
        throw new Error("Failed to load projects");
    }
    return response.json();
}

export async function getProject(id) {

    const response = await fetch(
        `${BASE_URL}/project-finance/project/${id}`
    );

    return response.json();
}

export async function updateProject(
    id,
    payload
) {

    const response = await fetch(

        `${BASE_URL}/project-finance/project/${id}`,

        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(payload)
        }

    );

    return response.json();

}

export async function analyzeProject(payload){

    const response = await fetch(
        `${BASE_URL}/project-finance/analyze`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload)
        }
    );

    if(!response.ok){
        throw new Error("Analysis Failed");
    }

    return response.json();
}

export async function buildAssetSchedule(payload){

    const response = await fetch(
        `${BASE_URL}/project-finance/assets`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(payload)
        }
    );

    if (!response.ok) {
    const errorText = await response.text();

    console.error(
        "BACKEND ERROR STATUS:",
        response.status
    );

    console.error(
        "BACKEND ERROR BODY:",
        errorText
    );

    throw new Error(
        `Analysis Failed: ${errorText}`
    );
}

    return response.json();

}

export async function exportProjectExcel(projectId) {

    const response = await fetch(
        `${BASE_URL}/project-finance/project/${projectId}/export/excel`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {

        throw new Error(
            "Excel export failed"
        );

    }

    return await response.blob();
}