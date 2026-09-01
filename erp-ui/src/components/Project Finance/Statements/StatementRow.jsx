import {formatFinancialNumber} from "../../../utils/formatNumber";

export default function StatementRow({
    label,
    field,
    data,
    rowClass = "",
    displayUnit
}) {



    return (

        <tr className={rowClass}>

            <td className="pf-sticky-label">
                {label}
            </td>

            {

                data.map((year) => {

                    let value = 0;

                    if (field.includes(".")) {

                        value = field
                            .split(".")
                            .reduce(
                                (obj, key) => obj?.[key],
                                year
                            );

                    } else {

                        value = year[field];

                    }

                    return (

                        <td key={year.year}>

                            <span
                                className={
                                    Number(value) < 0
                                        ? "pf-negative"
                                        : Number(value) > 0
                                        ? "pf-positive"
                                        : ""
                                }
                            >
                                  
                                {formatFinancialNumber(value, displayUnit)}
                            </span>

                        </td>

                    );

                })

            }

        </tr>

    );

}