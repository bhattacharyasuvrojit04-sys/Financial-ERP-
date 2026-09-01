import StatementRow from "./StatementRow";

export default function WorkingCapitalP({ data }) {

    return (

        <div className="pf-statement">

            <h2 className="pf-statement-title">
                Working Capital Schedule
            </h2>

            <div className="pf-statement pf-working-capital">

                <table className="pf-table">

                    <thead>

                        <tr>

                            <th className="pf-sticky-label">
                                Working Capital
                            </th>

                            {data.map(year => (

                                <th key={year.year}>
                                    Y{year.year}
                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {/* OPERATING DRIVERS */}

                        <tr className="section">
                            <td colSpan={data.length + 1}>
                                OPERATING DRIVERS
                            </td>
                        </tr>

                        <StatementRow
                            label="Revenue"
                            field="revenue"
                            data={data}
                        />

                        <StatementRow
                            label="Operating Expenses"
                            field="opex"
                            data={data}
                        />

                        {/* CURRENT ASSETS */}

                        <tr className="section">
                            <td colSpan={data.length + 1}>
                                CURRENT ASSETS
                            </td>
                        </tr>

                        <StatementRow
                            label="Accounts Receivable"
                            field="working_capital_breakdown.Accounts Receivable"
                            data={data}
                        />

                        <StatementRow
                            label="Inventory"
                            field="working_capital_breakdown.Inventory"
                            data={data}
                        />

                        <StatementRow
                            label="Prepaid Expenses"
                            field="working_capital_breakdown.Prepaid Expenses"
                            data={data}
                        />

                        <StatementRow
                            label="Other Current Assets"
                            field="working_capital_breakdown.Other Current Assets"
                            data={data}
                        />

                        

                        <StatementRow
                            label="Total Current Assets"
                            field="current_assets"
                            data={data}
                            rowClass="total-row"
                        />

                        

                        {/* CURRENT LIABILITIES */}

                        <tr className="section">
                            <td colSpan={data.length + 1}>
                                CURRENT LIABILITIES
                            </td>
                        </tr>

                        <StatementRow
                            label="Accounts Payable"
                            field="working_capital_breakdown.Accounts Payable"
                            data={data}
                        />

                        <StatementRow
                            label="Other Current Liabilities"
                            field="working_capital_breakdown.Other Current Liabilities"
                            data={data}
                        />

                        

                        <StatementRow
                            label="Total Current Liabilities"
                            field="current_liabilities"
                            data={data}
                            rowClass="total-row"
                        />

                        

                        {/* WORKING CAPITAL */}

                        <tr className="section">
                            <td colSpan={data.length + 1}>
                                WORKING CAPITAL
                            </td>
                        </tr>

                        

                        <StatementRow
                            label="Net Working Capital"
                            field="nwc"
                            data={data}
                            rowClass="closing-row"
                        />

                       

                        

                        <StatementRow
                            label="Change in NWC"
                            field="change_in_nwc"
                            data={data}
                            rowClass="closing-row"
                        />

                        

                    </tbody>

                </table>

            </div>

        </div>

    );

}