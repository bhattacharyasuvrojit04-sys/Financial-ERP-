export default function BalanceSheet({
    data
}) {

    if (!data?.length) {
        return null;
    }

    const assetKeys =
        Object.keys(
            data[0].asset_breakdown || {}
        );

    const liabilityKeys =
        Object.keys(
            data[0].liability_breakdown || {}
        );

    const equityKeys =
        Object.keys(
            data[0].equity_breakdown || {}
        );

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
                            Balance Sheet
                        </th>

                        {data.map(year => (

                            <th key={year.year}>
                                Y{year.year}
                            </th>

                        ))}

                    </tr>

                </thead>

                <tbody>

                    {/* ASSETS */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            ASSETS
                        </td>

                    </tr>

                    {assetKeys.map(key => (

                        <tr key={key}>

                            <td className="pf-sticky-label">
                                {key}
                            </td>

                            {data.map(year => (

                                <td key={year.year}>
                                    {fmt(
                                        year.asset_breakdown?.[key]
                                    )}
                                </td>

                            ))}

                        </tr>
                    ))}


                    <tr>

                        <td className="pf-sticky-label">
                            <b>Total Assets</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(
                                        year.total_assets
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* LIABILITIES */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            LIABILITIES
                        </td>

                    </tr>

                    {liabilityKeys.map(key => (

                        <tr key={key}>

                            <td className="pf-sticky-label">
                                {key}
                            </td>

                            {data.map(year => (

                                <td key={year.year}>
                                    {fmt(
                                        year.liability_breakdown?.[key]
                                    )}
                                </td>

                            ))}

                        </tr>

                    ))}

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Total Liabilities</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(
                                        year.total_liabilities
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* EQUITY */}

                    <tr>

                        <td
                            colSpan={data.length + 1}
                            className="pf-section-row"
                        >
                            EQUITY
                        </td>

                    </tr>

                    {equityKeys.map(key => (

                        <tr key={key}>

                            <td className="pf-sticky-label">
                                {key}
                            </td>

                            {data.map(year => (

                                <td key={year.year}>
                                    {fmt(
                                        year.equity_breakdown?.[key]
                                    )}
                                </td>

                            ))}

                        </tr>

                    ))}

                    <tr>

                        <td className="pf-sticky-label">
                            <b>Total Equity</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {fmt(
                                        year.total_equity
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* CHECK */}

                    <tr>

                        <td className="pf-sticky-label">
                            Balance Sheet Gap
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                {fmt(
                                    year.balance_sheet_gap
                                )}
                            </td>

                        ))}

                    </tr>

                </tbody>

            </table>

        </div>

    );

}