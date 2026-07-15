export default function KPIBar() {

    const cards = [

        "Project IRR",
        "NPV",
        "DSCR",
        "Payback",
        "Total Capex"

    ];

    return (

        <div className="pf-kpis">

            {

                cards.map(card => (

                    <div
                        key={card}
                        className="pf-kpi"
                    >

                        <div className="pf-kpi-label">
                            {card}
                        </div>

                        <div className="pf-kpi-value">
                            --
                        </div>

                        <div className="pf-kpi-sub">
                            Waiting for analysis
                        </div>

                    </div>

                ))

            }

        </div>

    );

}