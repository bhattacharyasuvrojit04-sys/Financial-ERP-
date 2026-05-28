import ollama
import json
import re

def analyze_financial_document(text):

    prompt = f"""
You are a financial analyst AI.

Extract financial metrics from this document.
Extract:
- current year revenue
- previous year revenue
- EBITDA
- CapEx

Return JSON only.

DOCUMENT:
{text[:4000]}
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

    raw_output = response["message"]["content"]

    print("RAW AI RESPONSE:")
    print(raw_output)

    try:

        # CLEAN markdown if model returns ```json
        cleaned = re.sub(r"```json|```", "", raw_output).strip()

        parsed = json.loads(cleaned)

        return parsed

    except Exception as e:

        print("JSON PARSE ERROR:", e)

        return {
            "error": "Invalid AI response",
            "raw_output": raw_output
        }