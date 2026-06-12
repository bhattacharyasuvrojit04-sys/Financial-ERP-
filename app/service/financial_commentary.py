import ollama

def generate_commentary(ratios):

    prompt = f"""
You are a senior equity research analyst.

Analyze these financial ratios.

Ratios:
{ratios}

Provide:

1. Strengths
2. Weaknesses
3. Risks
4. Valuation implications
"""

    response = ollama.chat(
        model="phi3:mini",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]