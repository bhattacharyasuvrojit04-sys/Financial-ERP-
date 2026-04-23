def classify(description: str, rules):
    description = description.lower()

    for rule in rules:
        if rule.keyword.lower() == description:
            return rule.category.strip().lower()
        
    return "unknown"