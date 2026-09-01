import StatementRow from "./StatementRow";

export default function IncomeStatement({ data, displayUnit }) {

    console.log("IncomeStatement rendered");
    console.log("Income Statement Data:", data);

    if (!data?.length) {

        console.log("NO DATA");

        return null;
    }

    console.log("RETURNING TABLE");

    return (

        <div className="pf-statement">

            <table>

                <thead>

                    <tr>

                        <th>
                            Income Statement
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
                        REVENUE
                    ========================== */}

                    <tr className="section">

                        <td colSpan={data.length + 1}>
                            REVENUE
                        </td>

                    </tr>

                    <StatementRow
                        label="Total Revenue"
                        field="revenue"
                        data={data}
                        displayUnit={displayUnit}
                    />


                    {/* =========================
                        COST OF GOODS SOLD
                    ========================== */}

                    <tr className="section">

                        <td colSpan={data.length + 1}>
                            COST OF GOODS SOLD
                        </td>

                    </tr>

                    <StatementRow
                        label="Total COGS"
                        field="cogs"
                        data={data}
                        displayUnit={displayUnit}
                    />


                    {/* =========================
                        GROSS PROFIT
                    ========================== */}

                    <StatementRow
                        label="Gross Profit"
                        field="gross_profit"
                        data={data}
                        rowClass="pf-row-gross-profit"
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="Gross Margin"
                        field="gross_margin"
                        data={data}
                        displayUnit={displayUnit}
                        isPercentage
                    />


                    {/* =========================
                        OPERATING EXPENSES
                    ========================== */}

                    <tr className="section">

                        <td colSpan={data.length + 1}>
                            OPERATING EXPENSES
                        </td>

                    </tr>

                    <StatementRow
                        label="Operating Costs"
                        field="opex"
                        data={data}
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="EBITDA"
                        field="ebitda"
                        data={data}
                        rowClass="pf-row-ebitda"
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="Depreciation"
                        field="depreciation"
                        data={data}
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="EBIT"
                        field="ebit"
                        data={data}
                        rowClass="pf-row-total"
                        displayUnit={displayUnit}
                    />


                    {/* =========================
                        FINANCING
                    ========================== */}

                    <tr className="section">

                        <td colSpan={data.length + 1}>
                            FINANCING
                        </td>

                    </tr>

                    <StatementRow
                        label="Interest Expense"
                        field="interest"
                        data={data}
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="EBT"
                        field="ebt"
                        data={data}
                        rowClass="pf-row-total"
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="Income Tax"
                        field="tax"
                        data={data}
                        displayUnit={displayUnit}
                    />

                    <StatementRow
                        label="Net Income"
                        field="pat"
                        data={data}
                        rowClass="pf-row-pat"
                        displayUnit={displayUnit}
                    />

                </tbody>

            </table>

        </div>

    );
}