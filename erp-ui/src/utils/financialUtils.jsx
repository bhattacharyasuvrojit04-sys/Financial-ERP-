export const buildPnl = (data) => {
    let operating_income = 0;
    let operating_expense = 0;
    let non_operating_income = 0;
    let non_operating_expense = 0;

    data.forEach(item => {
        switch(item.type) {
            case "operating_income":
                operating_income += item.amount;
                break;
            case "operating_expense":
                operating_expense += item.amount;
                break;
            case "non_operating_income":
                non_operating_income += item.amount;
                break;
            case "non_operating_expense":
                non_operating_expense += item.amount;
                break;
            default:
                break;}
        });

    const operating_profit = operating_income - operating_expense;
    const profit_before_tax = operating_profit + non_operating_income - non_operating_expense;
    
    return {
         operating_income,
    operating_expense,
    operating_profit,
    non_operating_income,
    non_operating_expense,
    profit_before_tax,
    net_profit: profit_before_tax
    };
    };

export const buildBalanceSheet = (data) => {
    let assets = 0;
    let liabilities= 0;

    data.forEach(item => {
        if (item.type == "asset") assets += item.amount;
        if (item.type == "liability") liabilities += item.amount;
    })
    return {
        total_Assets: assets,
        total_Liabilities: liabilities,
        equity: assets - liabilities
    };
};

export const buildCashFlow = (data) => {
    if (!Array.isArray(data)) {
        console.warn("Expected array data for cash flow, got:", data);
        return {
            cash_inflow: 0,
            cash_outflow: 0,
            net_cash: 0
        }
    }

    let inflow = 0;
    let outflow = 0;

    data.forEach (item => {
        if(item.type == "inflow") inflow += item.amount;
        if(item.type == "outflow") outflow += item.amount;
    });

    return{
        Cash_Inflow: inflow,
        Cash_outflow: outflow,
        net_cash: inflow - outflow
    };
};

    
