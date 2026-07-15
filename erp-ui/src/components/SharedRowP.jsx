export default function Row({ label, field, data }) {
  return (
    <tr>
      <td className="border p-2 font-medium">
        {label}
      </td>

      {data.map((year) => (
        <td
          key={year.year}
          className="border p-2 text-right"
        >
          {Number(year[field] || 0).toLocaleString()}
        </td>
      ))}
    </tr>
  );
}