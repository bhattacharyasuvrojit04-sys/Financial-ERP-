def build_working_capital (project, projection):

    schedule = []

    previous_nwc = 0

    wc = project.working_capital

    print("===== WORKING CAPITAL INPUTS =====")
    print("Prepaid:", wc.prepaid_expenses)
    print("Prepaid Growth:", wc.prepaid_growth_rate)

    print("Other CA:", wc.other_current_assets)
    print("Other CA Growth:", wc.other_current_assets_growth_rate)

    print("Other CL:", wc.other_current_liabilities)
    print("Other CL Growth:", wc.other_current_liabilities_growth_rate)
    print("==============================")

    receivable_days = wc.receivable_days
    inventory_days = wc.inventory_days
    payable_days = wc.payable_days

    for row in projection:
        revenue = row["revenue"]
        cogs = row["cogs"]

        accounts_receivable = (revenue * receivable_days) / 365

        accounts_payable = (cogs * payable_days) / 365

        inventory = (cogs * inventory_days) / 365

        prepaid_expenses = project.working_capital.prepaid_expenses * (1 + project.working_capital.prepaid_growth_rate / 100) ** (row["year"] - 1)

        other_current_assets = (project.working_capital.other_current_assets* (1 + project.working_capital.other_current_assets_growth_rate / 100) ** (row["year"] - 1))

        other_current_liabilities = (project.working_capital.other_current_liabilities* (1 + project.working_capital.other_current_liabilities_growth_rate  / 100) ** (row["year"] - 1))

        print(
            f"Year {row['year']} | "
            f"Prepaid={prepaid_expenses:.2f} | "
            f"Other CA={other_current_assets:.2f} | "
            f"Other CL={other_current_liabilities:.2f}"
        )
        
        current_assets = (

            accounts_receivable

            + inventory

            + prepaid_expenses

            + other_current_assets

        )

        current_liabilities = (

            accounts_payable            

            + other_current_liabilities

        )

        nwc = (

            current_assets

            - current_liabilities

        )

        change = nwc - previous_nwc

        previous_nwc = nwc

        schedule.append({

            "year": row["year"],

            "receivables": round(accounts_receivable,2),

            "inventory": round(inventory,2),

            "payables": round(accounts_payable,2),

            "prepaid_expenses": round(prepaid_expenses,2),

            "other_current_assets": round(other_current_assets,2),

            "other_current_liabilities": round(other_current_liabilities,2),

            "current_assets": round(current_assets,2),

            "current_liabilities": round(current_liabilities,2),

            "nwc": round(nwc,2),

            "change_in_nwc": round(change,2)

        })

    return schedule