def generate_assumptions(ai_response):

    print("AI RESPONSE:")
    print(ai_response)

    data = ai_response

    assumptions = {
        "revenue_growth": {
            "value": 12.5,  #"value": data.get("revenue_growth")
            "confidence": 91
        },

        "ebitda_margin": {
            "value": 25.0,  #"value": data.get("ebitda_margin")
            "confidence": 82
        },

        "capex_pct": {
            "value": 15.0,  #"value": data.get("capex_pct")
            "confidence": 71
        }
    }

    return assumptions