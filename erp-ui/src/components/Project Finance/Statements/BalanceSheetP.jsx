import { formatFinancialNumber } from "../../../utils/formatNumber";

export default function BalanceSheet({ data, displayUnit }) {

    if (!data?.length) {
        return null;
    }

    const assetKeys =
        Object.keys(data[0].asset_breakdown || {});

    const liabilityKeys =
        Object.keys(data[0].liability_breakdown || {});

    const equityKeys =
        Object.keys(data[0].equity_breakdown || {});

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

                    {/* =========================
                        ASSETS
                    ========================= */}

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
                                    {formatFinancialNumber(
                                        year.asset_breakdown?.[key], displayUnit
                                    )}
                                </td>

                            ))}

                        </tr>

                    ))}

                    <tr className="pf-row-total">

                        <td className="pf-sticky-label">
                            <b>Total Assets</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {formatFinancialNumber(
                                        year.total_assets, displayUnit
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* =========================
                        LIABILITIES
                    ========================= */}

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
                                    {formatFinancialNumber(
                                        year.liability_breakdown?.[key], displayUnit
                                    )}
                                </td>

                            ))}

                        </tr>

                    ))}

                    <tr className="pf-row-total">

                        <td className="pf-sticky-label">
                            <b>Total Liabilities</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {formatFinancialNumber(
                                        year.total_liabilities, displayUnit
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* =========================
                        EQUITY
                    ========================= */}

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
                                    {formatFinancialNumber(
                                        year.equity_breakdown?.[key], displayUnit
                                    )}
                                </td>

                            ))}

                        </tr>

                    ))}

                    <tr className="pf-row-total">

                        <td className="pf-sticky-label">
                            <b>Total Equity</b>
                        </td>

                        {data.map(year => (

                            <td key={year.year}>
                                <b>
                                    {formatFinancialNumber(
                                        year.total_equity, displayUnit
                                    )}
                                </b>
                            </td>

                        ))}

                    </tr>

                    {/* =========================
                        CHECK
                    ========================= */}

                    <tr>

                        <td className="pf-sticky-label">
                            Balance Sheet Gap
                        </td>

                        {data.map(year => (

                            <td
                                key={year.year}
                                className={
                                    Number(year.balance_sheet_gap) < 0
                                        ? "pf-negative"
                                        : Number(year.balance_sheet_gap) > 0
                                        ? "pf-positive"
                                        : ""
                                }
                            >
                                {formatFinancialNumber(
                                    year.balance_sheet_gap, displayUnit
                                )}
                            </td>

                        ))}

                    </tr>

                </tbody>

            </table>

        </div>

    );

}