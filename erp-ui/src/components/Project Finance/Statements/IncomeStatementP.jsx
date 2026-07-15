export default function IncomeStatement({
    data
}) {

    if (!data?.length) {

        return null;

    }

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

                    <tr className="section">
                        <td colSpan={26}>
                            REVENUE
                        </td>
                    </tr>

                    <tr>

                        <td>Total Revenue</td>

                        {data.map(year => (

                            <td key={year.year}>

                                {Math.round(
                                    year.revenue / 1000000
                                ).toLocaleString()} M

                            </td>

                        ))}

                    </tr>

                    <tr className="section">
                        <td colSpan={26}>
                            OPERATING EXPENSES
                        </td>
                    </tr>

                    <tr>

                        <td>Operating Costs</td>

                        {data.map(year => (

                            <td key={year.year}>

                                {Math.round(
                                    year.opex / 1000000
                                ).toLocaleString()} M

                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td>Depreciation</td>

                        {data.map(year => (

                            <td key={year.year}>

                                {Math.round(
                                    year.depreciation / 1000000
                                ).toLocaleString()} M

                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td><b>EBIT</b></td>

                        {data.map(year => (

                            <td key={year.year}>

                                <b>

                                {Math.round(
                                    year.ebit / 1000000
                                ).toLocaleString()} M

                                </b>

                            </td>

                        ))}

                    </tr>

                    <tr className="section">
                        <td colSpan={26}>
                            FINANCING
                        </td>
                    </tr>

                    <tr>

                        <td>Interest Expense</td>

                        {data.map(year => (

                            <td key={year.year}>

                                {Math.round(
                                    year.interest / 1000000
                                ).toLocaleString()} M

                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td><b>EBT</b></td>

                        {data.map(year => (

                            <td key={year.year}>

                                <b>

                                {Math.round(
                                    year.ebt / 1000000
                                ).toLocaleString()} M

                                </b>

                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td>Income Tax</td>

                        {data.map(year => (

                            <td key={year.year}>

                                {Math.round(
                                    year.tax / 1000000
                                ).toLocaleString()} M

                            </td>

                        ))}

                    </tr>

                    <tr>

                        <td><b>Net Income</b></td>

                        {data.map(year => (

                            <td key={year.year}>

                                <b>

                                {Math.round(
                                    year.pat / 1000000
                                ).toLocaleString()} M

                                </b>

                            </td>

                        ))}

                    </tr>

                </tbody>

            </table>

        </div>

    );

}