from .peer_data import PEER_DATA

def benchmark_metric(value, metric, industry="technology"):

    peer = PEER_DATA[industry][metric]

    median = peer["median"]
    p75 = peer["p75"]
    p25 = peer["p25"]

    if value > p75:
        position = "Top Quartile"

    elif value < p25:
        position = "Bottom Quartile"

    else:
        position = "Average"

    return {
        "value": value,
        "peer_median": median,
        "position": position,
        "difference": round(value - median, 2)
    }


def generate_peer_analysis(assumptions):

    return {
        "revenue_growth":
            benchmark_metric(
                assumptions["revenue_growth"],
                "revenue_growth"
            ),

        "ebitda_margin":
            benchmark_metric(
                assumptions["ebitda_margin"],
                "ebitda_margin"
            ),

        "capex_pct":
            benchmark_metric(
                assumptions["capex_pct"],
                "capex_pct"
            )
    }
