from typing import List


def build_asset_schedule(project):

    print("========== BUILD ASSET SCHEDULE ==========")
    print("Number of assets:", len(project.fixed_assets))
    print(project.fixed_assets)

    schedule = []

    assets = project.fixed_assets

    for year in range(1, project.project_life + 1):

        year_assets = []

        total_gross_block = 0
        total_acc_dep = 0
        total_net_block = 0

        for asset in assets:

            # -----------------------------
            # Opening Cost
            # -----------------------------

            if year == 1:

                opening_cost = 0

            else:

                previous = next(
                    (
                        a
                        for a in schedule[-1]["assets"]
                        if a["asset_name"] == asset.asset_name
                    ),
                    None,
                )

                opening_cost = previous["closing_cost"] if previous else 0

            # -----------------------------
            # Purchase
            # -----------------------------

            purchase = (
                asset.purchase_cost
                if asset.purchase_year == year
                else 0
            )

            # -----------------------------
            # Disposal
            # -----------------------------

            disposal_cost = (
                asset.purchase_cost
                if asset.sale_year == year
                else 0
            )

            disposed = (
                        asset.sale_year not in (None, 0)
                        and year > asset.sale_year
                    )

            # -----------------------------
            # Closing Gross Block
            # -----------------------------

            closing_cost = opening_cost + purchase - disposal_cost

            # -----------------------------
            # Opening Accumulated Depreciation
            # -----------------------------

            if year == 1:

                opening_acc_dep = 0

            else:

                previous = next(
                    (
                        a
                        for a in schedule[-1]["assets"]
                        if a["asset_name"] == asset.asset_name
                    ),
                    None,
                )

                if previous and previous["closing_cost"] > 0:

                    opening_acc_dep = previous["closing_acc_dep"]

                else:

                    opening_acc_dep = 0

            # -----------------------------
            # Depreciation
            # -----------------------------

            depreciation = 0

            if (
                not asset.is_land
                and year >= asset.purchase_year
                and year < asset.purchase_year + asset.useful_life
                and year != asset.sale_year
                and not disposed
            ):

                print(
                    asset.asset_name,
                    asset.depreciation_method,
                    asset.depreciation_rate,
                    asset.purchase_cost,
                )

                if asset.depreciation_method.upper() == "SLM":

                    depreciation = (
                        asset.purchase_cost
                        - asset.salvage_value
                    ) / asset.useful_life

                elif asset.depreciation_method.upper() == "WDV":

                    rate = asset.depreciation_rate / 100

                    if year == asset.purchase_year:

                        book_value = asset.purchase_cost

                    else:

                        previous = next(
                            (
                                a
                                for a in schedule[-1]["assets"]
                                if a["asset_name"] == asset.asset_name
                            ),
                            None,
                        )

                        book_value = previous["net_block"] if previous else 0

                        print("---------------------------")
                        print("Asset:", asset.asset_name)
                        print("Year:", year)
                        print("Purchase Year:", asset.purchase_year)
                        print("Method:", asset.depreciation_method)
                        print("Rate:", asset.depreciation_rate)
                        print("Book Value:", book_value)
                        print("Disposed:", disposed)

                    depreciation = book_value * rate

                    print("Depreciation:", depreciation)

            # -----------------------------
            # Closing Accumulated Depreciation
            # -----------------------------

            closing_acc_dep = opening_acc_dep + depreciation

            # -----------------------------
            # Net Block
            # -----------------------------

            net_block = closing_cost - closing_acc_dep

            # -----------------------------
            # Asset removed after disposal
            # -----------------------------

            if disposed:

                closing_cost = 0
                closing_acc_dep = 0
                depreciation = 0
                net_block = 0

           
            year_assets.append({

                "asset_name": asset.asset_name,
                "category": asset.asset_category,

                "opening_cost": round(opening_cost, 2),
                "purchase": round(purchase, 2),
                "sale": round(disposal_cost, 2),

                "closing_cost": round(closing_cost, 2),

                "opening_acc_dep": round(opening_acc_dep, 2),
                "depreciation": round(depreciation, 2),
                "closing_acc_dep": round(closing_acc_dep, 2),

                "net_block": round(net_block, 2),

            })

            total_gross_block += closing_cost
            total_acc_dep += closing_acc_dep
            total_net_block += net_block

        schedule.append({

            "year": year,

            "assets": year_assets,

            "total_gross_block": round(total_gross_block, 2),
            "total_acc_dep": round(total_acc_dep, 2),
            "total_net_block": round(total_net_block, 2),

        })

    return schedule