export default function StatementRow({
    label,
    field,
    data
}) {

    return (

        <tr>

            <td
                className="
                pf-sticky-label
                "
            >
                {label}
            </td>

            {

                data.map(year => (

                    <td
                        key={year.year}
                    >

                        {Number(
                            year[field] || 0
                        ).toLocaleString()}

                    </td>

                ))

            }

        </tr>

    );

}