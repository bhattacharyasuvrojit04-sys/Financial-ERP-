export default function CashFlow({
    data
}) {

    if (!data?.length) {
        return null;
    }

    const fmt = (v) =>
        `${Math.round(
            Number(v || 0) / 1000000
        ).toLocaleString()} M`;

    return (

        <div className="pf-statement">

            <table className="pf-table">

                <thead>

                    <tr>

                        <th className="pf-sticky-label">
                            Cash Flow Statement
                        </th>

                        {data.map(year => (

                            <th key={year.year}>
                                Y{year.year}
                            </th>

                        ))}

                    </tr>

                </thead>

                <tbody>

                    {/* OPERATING */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            OPERATING ACTIVITIES
                        </td>

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            PAT
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.pat)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Depreciation
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.depreciation)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Change in NWC
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.change_in_nwc)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Operating Cash Flow</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(year.cashflow_operations)}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* INVESTING */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            INVESTING ACTIVITIES
                        </td>

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Capex Outflow
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.capex_outflow)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td>Interest During Construction</td>

                            {data.map(year=>

                        <td>

                            {fmt(year.idc)}

                        </td>

                        )}

                        </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Asset Investment
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(
                                    year.non_current_asset_investment
                                )}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Liability Change
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(
                                    year.non_current_liability_change
                                )}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Investing Cash Flow</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(year.cashflow_investing)}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* FINANCING */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            FINANCING ACTIVITIES
                        </td>

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Debt Drawdown
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.debt_drawn)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Principal Repayment
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.principal_repayment)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Equity Contribution
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.equity_drawn)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Financing Cash Flow</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(year.cashflow_financing)}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* CASH MOVEMENT */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            CASH MOVEMENT
                        </td>

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Net Change In Cash
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.net_cash_flow)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            Opening Cash
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(year.opening_cash)}
                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Closing Cash</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(year.closing_cash)}
                                </b>
                            </td>

                        ))}

                    </tr>

                </tbody>

            </table>

        </div>

    );

}