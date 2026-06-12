def calculate_document_ratios(metrics):

    revenue = metrics.get("revenue") or 0
    operating_income = metrics.get("operating_income") or 0
    net_income = metrics.get("net_income") or 0
    capex = metrics.get("capex") or 0
    debt = metrics.get("debt") or 0

    return {
        "ebitda_margin": round(operating_income / revenue * 100, 2) if revenue != 0 else 0,
        "net_margin": round(net_income / revenue * 100, 2) if revenue != 0 else 0,
        "capex_pct": round(capex / revenue * 100, 2) if revenue != 0 else 0,
        "debt_to_ebitda": round(debt / operating_income, 2) if operating_income != 0 else 0,
        "debt_ratio": round(debt / revenue, 2) if revenue != 0 else 0
    }
