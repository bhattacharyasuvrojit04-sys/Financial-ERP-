export default function DebtScheduleP({ data }) {

    if (!data?.length) {
        return (
            <div className="pf-statement">
                <p>No Debt Schedule Available</p>
            </div>
        );
    }

    const fmt = (value) =>
        Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

    return (

        <div className="pf-statement">

            <h3>Debt Schedule</h3>

            <table className="pf-table">

                <thead>

                    <tr>
                        <th>Month</th>
                        <th>Opening Balance</th>
                        <th>Drawdown</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>IDC</th>
                        <th>Closing Balance</th>

                    </tr>

                </thead>

                <tbody>

                    {data.map((row) => (

                        <tr key={row.month}>

                            <td>{row.month}</td>

                            <td>{fmt(row.opening_balance)}</td>

                            <td>{fmt(row.drawdown)}</td>

                            <td>{fmt(row.principal)}</td>

                            <td>{fmt(row.interest)}</td>

                            <td>{fmt(row.idc)}</td>

                            <td>{fmt(row.closing_balance)}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}