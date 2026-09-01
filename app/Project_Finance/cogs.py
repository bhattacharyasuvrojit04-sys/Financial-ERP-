def build_cogs(project, inputs):

    total_cogs = 0
    breakdown = {}

    industry = (project.project_type or "").lower()

    for item in project.cogs_items:

        # =========================
        # SOLAR
        # =========================

        if industry == "solar":

            if item.cogs_type.lower() == "variable":

                generation = inputs.get("generation", 0) or 0
                cost_per_kwh = item.cost_per_kwh or 0

                cost = generation * cost_per_kwh

                breakdown[item.name] = {
                    "type": "variable",
                    "generation": round(generation, 2),
                    "cost_per_kwh": round(cost_per_kwh, 2),
                    "cost": round(cost, 2)
                }

            else:

                amount = item.amount or 0
                growth_rate = item.growth_rate or 0
                year = inputs.get("year", 1)

                construction_years = max(
                    1,
                    (project.construction_period_months + 11) // 12
                )

                operating_year = year - construction_years

                if operating_year <= 0:
                    cost = 0
                else:
                    cost = (
                        amount
                        * (1 + growth_rate / 100)
                        ** (operating_year - 1)
                    )

                breakdown[item.name] = {
                    "type": "fixed",
                    "amount": round(amount, 2),
                    "growth_rate": round(growth_rate, 2),
                    "cost": round(cost, 2)
                }

        # =========================
        # HOTEL
        # =========================

        elif industry == "hotel":

            if item.cogs_type.lower() == "variable":

                occupied_room_nights = (
                    inputs.get("occupied_room_nights", 0) or 0
                )

                cost_per_room = item.cost_per_room or 0

                cost = (
                    occupied_room_nights
                    * cost_per_room
                )

                breakdown[item.name] = {
                    "type": "variable",
                    "occupied_room_nights": round(
                        occupied_room_nights, 2
                    ),
                    "cost_per_room": round(
                        cost_per_room, 2
                    ),
                    "cost": round(cost, 2)
                }

            else:

                amount = item.amount or 0
                growth_rate = item.growth_rate or 0
                year = inputs.get("year", 1)

                construction_years = max(
                    1,
                    (project.construction_period_months + 11) // 12
                )

                operating_year = year - construction_years

                if operating_year <= 0:
                    cost = 0
                else:
                    cost = (
                        amount
                        * (1 + growth_rate / 100)
                        ** (operating_year - 1)
                    )

                breakdown[item.name] = {
                    "type": "fixed",
                    "amount": round(amount, 2),
                    "growth_rate": round(growth_rate, 2),
                    "cost": round(cost, 2)
                }

        # =========================
        # OTHER
        # =========================

        else:

            amount = item.amount or 0
            growth_rate = item.growth_rate or 0
            year = inputs.get("year", 1)

            construction_years = max(
                1,
                (project.construction_period_months + 11) // 12
            )

            operating_year = year - construction_years

            if operating_year <= 0:
                cost = 0
            else:
                cost = (
                    amount
                    * (1 + growth_rate / 100)
                    ** (operating_year - 1)
                )

            breakdown[item.name] = {
                "type": "fixed",
                "amount": round(amount, 2),
                "growth_rate": round(growth_rate, 2),
                "cost": round(cost, 2)
            }

        total_cogs += cost

    return {
        "total": round(total_cogs, 2),
        "breakdown": breakdown
    }