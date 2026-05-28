def generate_assumptions(ai_response):

    print("AI RESPONSE:")
    print(ai_response)

    data = ai_response

    assumptions = {
        "revenue_growth": {
            "value": data.get("revenue_growth"),
            "confidence": 91
        },

        "ebitda_margin": {
            "value": data.get("ebitda_margin"),
            "confidence": 82
        },

        "capex_pct": {
            "value": data.get("capex_pct"),
            "confidence": 71
        }
    }

    return assumptions