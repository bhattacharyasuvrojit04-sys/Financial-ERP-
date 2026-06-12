import re

def extract_financial_metrics(text):

    # ================= DEBUG =================

    print("\n================ PDF TEXT START ================\n")
    print(text[:10000])
    print("\n================ PDF TEXT END ==================\n")

    print("\nNET SALES MATCHES:")
    print(re.findall(r"net sales.{0,100}", text, re.I))

    print("\nNET INCOME MATCHES:")
    print(re.findall(r"net income.{0,100}", text, re.I))

    print("\nTERM DEBT MATCHES:")
    print(re.findall(r"term debt.{0,100}", text, re.I))

    # ================= METRICS =================

    metrics = {
        "revenue": None,
        "operating_income": None,
        "net_income": None,
        "capex": None,
        "cash": None,
        "debt": None
    }

    # ================= REVENUE =================
    revenue_patterns = [
        r"total\s+net\s+sales\s+\$?\s*([\d,]+)",
        r"net\s+sales\s+\$?\s*([\d,]+)",
        r"total\s+sales\s+\$?\s*([\d,]+)",
        r"revenue[s]?\s+\$?\s*([\d,]+)"
    ]

    for pattern in revenue_patterns:
        match = re.search(pattern, text, re.I)
        if match:
            metrics["revenue"] = float(
                match.group(1).replace(",", "")
            )
            break

    # ================= OPERATING INCOME =================

    operating_patterns = [
        r"operating\s+income\s+\$?\s*([\d,]+)"
    ]

    for pattern in operating_patterns:
        match = re.search(pattern, text, re.I)
        if match:
            metrics["operating_income"] = float(
                match.group(1).replace(",", "")
            )
            break

    # ================= NET INCOME =================

    net_income_patterns = [
        r"\bnet income\b\s+\$?\s*([\d,]+)",
        r"net earnings\s+\$?\s*([\d,]+)"
    ]

    matches = []

    for pattern in net_income_patterns:

        found = re.findall(pattern, text, re.I)

        for item in found:

            try:
                matches.append(
                    float(item.replace(",", ""))
                )
            except:
                pass

    if matches:
        metrics["net_income"] = max(matches)

    # ================= CAPEX =================

    capex_patterns = [
        r"payments\s+for\s+acquisition\s+of\s+property,\s*plant\s+and\s+equipment\D+([\d,]+)",
        r"capital expenditures?\D+([\d,]+)",
        r"purchase[s]?\s+of\s+property,\s*plant\s+and\s+equipment\D+([\d,]+)"
    ]

    for pattern in capex_patterns:

        match = re.search(pattern, text, re.I)

        if match:

            metrics["capex"] = float(
                match.group(1).replace(",", "")
            )

            break

    # ================= CASH =================

    cash_patterns = [
        r"cash\s+and\s+cash\s+equivalents\s+\$?\s*([\d,]+)",
        r"cash\s+\$?\s*([\d,]+)"
    ]

    for pattern in cash_patterns:

        match = re.search(pattern, text, re.I)

        if match:

            metrics["cash"] = float(
                match.group(1).replace(",", "")
            )

            break

    # ================= DEBT =================

    debt_matches = re.findall(
        r"term debt\s+\$?\s*([\d,]+)",
        text,
        re.I
    )

    if debt_matches:

        metrics["debt"] = sum(
            float(x.replace(",", ""))
            for x in debt_matches
        )

    else:

        debt_patterns = [
            r"total debt\s+\$?\s*([\d,]+)",
            r"long[- ]term debt\s+\$?\s*([\d,]+)"
        ]

        for pattern in debt_patterns:

            match = re.search(pattern, text, re.I)

            if match:

                metrics["debt"] = float(
                    match.group(1).replace(",", "")
                )

                break

    print("\n================ EXTRACTED METRICS ================\n")
    print(metrics)
    print("\n===================================================\n")

    return metrics