export default function CapexInput({
  item,
  index,
  updateCapex
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">

      <input
        className="border p-2 rounded"
        placeholder="Capex Item"
        value={item.name}
        onChange={(e) =>
          updateCapex(index, "name", e.target.value)
        }
      />

      <input
        className="border p-2 rounded"
        type="number"
        placeholder="Amount"
        value={item.amount}
        onChange={(e) =>
          updateCapex(index, "amount", Number(e.target.value))
        }
      />

    </div>
  );
}