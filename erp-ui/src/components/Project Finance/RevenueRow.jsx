import React from "react";

export default function RevenueRow({
    title,
    values = [],
    blue = false
}) {
    return (
        <tr className={blue ? "statement-blue" : ""}>
            <td>{title}</td>

            {values.map((v, i) => (
                <td key={i}>
                    {v == null
                        ? "-"
                        : Number(v).toLocaleString()}
                </td>
            ))}
        </tr>
    );
}