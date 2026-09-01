export default function KPIBar({ result }) {

    /*
     * Backend returns:
     *
     * {
     *   analysis_schedule: [...],
     *   project_irr: ...,
     *   equity_irr: ...,
     *   npv: ...,
     *   minimum_dscr: ...
     * }
     */

    const analysisSchedule =
        result?.analysis_schedule || [];

    // ---------------------------------------------------------
    // FINAL PROJECT IRR
    // ---------------------------------------------------------

    const projectIRR =
        result?.project_irr ??
        (
            analysisSchedule.length > 0
                ? analysisSchedule[
                    analysisSchedule.length - 1
                  ]?.project_irr
                : null
        );

    // ---------------------------------------------------------
    // FINAL EQUITY IRR
    // ---------------------------------------------------------

    const equityIRR =
        result?.equity_irr ??
        (
            analysisSchedule.length > 0
                ? analysisSchedule[
                    analysisSchedule.length - 1
                  ]?.equity_irr
                : null
        );

    // ---------------------------------------------------------
    // NPV
    // ---------------------------------------------------------

    const npv =
        result?.npv ??
        (
            analysisSchedule.length > 0
                ? analysisSchedule[
                    analysisSchedule.length - 1
                  ]?.npv
                : null
        );

    // ---------------------------------------------------------
    // MINIMUM DSCR
    // ---------------------------------------------------------

    let minimumDSCR =
        result?.minimum_dscr ?? null;

    /*
     * If backend does not directly return minimum_dscr,
     * calculate it from analysis_schedule.
     */

    if (
        minimumDSCR === null &&
        analysisSchedule.length > 0
    ) {

        const dscrValues =
            analysisSchedule

                .map(row => row?.dscr)

                .filter(
                    value =>
                        value !== null &&
                        value !== undefined &&
                        Number.isFinite(Number(value))
                )

                .map(Number);

        if (dscrValues.length > 0) {

            minimumDSCR =
                Math.min(...dscrValues);

        }

    }

    // ---------------------------------------------------------
    // FORMATTERS
    // ---------------------------------------------------------

    const formatPercent = (value) => {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "--";
        }

        return `${(
            Number(value) * 100
        ).toFixed(1)}%`;

    };

    const formatNPV = (value) => {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "--";
        }

        return Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };

    const formatDSCR = (value) => {

        if (
            value === null ||
            value === undefined ||
            !Number.isFinite(Number(value))
        ) {
            return "--";
        }

        return `${Number(value).toFixed(2)}x`;

    };

    // ---------------------------------------------------------
    // KPI CARDS
    // ---------------------------------------------------------

    const cards = [

        {
            label: "Project IRR",
            value: formatPercent(projectIRR),
            sub: "Unlevered return"
        },

        {
            label: "Equity IRR",
            value: formatPercent(equityIRR),
            sub: "Levered equity return"
        },

        {
            label: "NPV",
            value: formatNPV(npv),
            sub: "₹ million"
        },

        {
            label: "Minimum DSCR",
            value: formatDSCR(minimumDSCR),
            sub: "Minimum annual coverage"
        }

    ];

    return (

        <div className="pf-kpis">

            {cards.map((card) => (

                <div
                    key={card.label}
                    className="pf-kpi"
                >

                    <div className="pf-kpi-label">
                        {card.label}
                    </div>

                    <div className="pf-kpi-value">
                        {card.value}
                    </div>

                    <div className="pf-kpi-sub">
                        {card.sub}
                    </div>

                </div>

            ))}

        </div>

    );

}