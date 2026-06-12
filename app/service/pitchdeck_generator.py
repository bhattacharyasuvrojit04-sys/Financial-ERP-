from ollama import chat

def generate_pitch_deck(text):

    prompt = f"""
You are a senior investment banking analyst.

Analyze this annual report and return ONLY valid JSON.

Required sections:

executive_summary
company_overview
financial_highlights
swot_strengths
swot_weaknesses
swot_opportunities
swot_threats
investment_thesis
investment_risks
recommendation

Annual Report:

{text[:15000]}
"""

    response = chat(
        model="phi3:mini",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]