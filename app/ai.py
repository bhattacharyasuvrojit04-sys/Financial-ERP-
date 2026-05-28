def classify(description: str, rules):
    description = description.lower()

    for rule in rules:
        if rule.keyword.lower() == description:
            return rule.category.strip().lower()
        
    return "unknown"


#c:\Users\Administrator\Desktop\erp_v2\venv\Scripts\activate.ps1


